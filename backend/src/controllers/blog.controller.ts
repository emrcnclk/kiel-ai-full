import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Blog } from '../models/Blog.model';
import { Notification, NotificationType } from '../models/Notification.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';

// Helper function to extract author ID from blog
const getAuthorId = (author: any): string => {
  if (author && typeof author === 'object' && author._id) {
    return author._id.toString();
  }
  return String(author);
};

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authorId = req.user?.id;
    if (!authorId) {
      return next(new AppError('Unauthorized', 401));
    }

    const blog = await Blog.create({
      ...req.body,
      author: authorId,
    });

    // Notify all clients about new blog post (non-blocking)
    if (blog.isPublished) {
      try {
        const clients = await User.find({ role: 'client' });
        if (clients.length > 0) {
          const notifications = clients.map((client: any) => ({
            user: client._id,
            type: NotificationType.NEW_BLOG_POST,
            title: 'Yeni Blog Yazısı',
            message: `${blog.title} başlıklı yeni bir blog yazısı yayınlandı.`,
            relatedId: blog._id,
          }));
          await Notification.insertMany(notifications);
        }
      } catch (notificationError) {
        // Log error but don't fail the blog creation
        console.error('Failed to send notifications:', notificationError);
      }
    }

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const getBlogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { published, author, category, tag, page, limit, search } = req.query;
    const query: any = {};

    if (published === 'true') {
      query.isPublished = true;
    } else if (req.user?.role !== 'expert' && req.user?.role !== 'admin') {
      query.isPublished = true; // Clients can only see published blogs
    }

    if (author) {
      if (author === 'me' && req.user?.id) {
        query.author = req.user.id;
      } else {
        if (!isValidObjectId(author as string)) {
          return next(new AppError('Invalid author ID', 400));
        }
        query.author = author;
      }
    }

    if (category) {
      query.categories = category;
    }

    if (tag) {
      query.tags = tag;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search as string, $options: 'i' } },
        { content: { $regex: search as string, $options: 'i' } },
        { excerpt: { $regex: search as string, $options: 'i' } },
        { categories: { $in: [new RegExp(search as string, 'i')] } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }

    // Pagination parameters
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (pageSize < 1 || pageSize > 100) {
      return next(new AppError('Limit must be between 1 and 100', 400));
    }

    // Get total count for pagination metadata
    const totalCount = await Blog.countDocuments(query);

    // Get paginated blogs
    const blogs = await Blog.find(query)
      .populate('author', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: pageNumber,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid blog ID', 400));
    }

    const blog = await Blog.findById(id).populate('author', 'email');

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check if user can view unpublished blog
    const authorId = getAuthorId(blog.author);
    
    if (!authorId) {
      return next(new AppError('Blog author not found', 500));
    }
    
    if (!blog.isPublished && req.user?.id !== authorId && req.user?.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    // Increment views atomically to prevent race conditions
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });
    
    // Fetch updated blog
    const updatedBlog = await Blog.findById(id).populate('author', 'email');

    res.json({ success: true, data: updatedBlog });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid blog ID', 400));
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check ownership or admin
    const authorId = getAuthorId(blog.author);
    
    if (authorId !== userId && req.user?.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    const wasPublished = blog.isPublished;
    Object.assign(blog, req.body);
    await blog.save();

    // Notify if newly published (non-blocking)
    if (!wasPublished && blog.isPublished) {
      try {
        const clients = await User.find({ role: 'client' });
        if (clients.length > 0) {
          const notifications = clients.map((client: any) => ({
            user: client._id,
            type: NotificationType.NEW_BLOG_POST,
            title: 'Yeni Blog Yazısı',
            message: `${blog.title} başlıklı yeni bir blog yazısı yayınlandı.`,
            relatedId: blog._id,
          }));
          await Notification.insertMany(notifications);
        }
      } catch (notificationError) {
        // Log error but don't fail the blog update
        console.error('Failed to send notifications:', notificationError);
      }
    }

    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid blog ID', 400));
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check ownership or admin
    const authorId = getAuthorId(blog.author);
    
    if (authorId !== userId && req.user?.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    next(error);
  }
};

