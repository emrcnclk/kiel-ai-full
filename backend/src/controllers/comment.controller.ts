import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { Comment } from '../models/Comment.model';
import { Blog } from '../models/Blog.model';
import { Activity } from '../models/Activity.model';
import mongoose from 'mongoose';

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { content, relatedType, relatedId, parentComment } = req.body;

    if (!content || content.trim().length === 0) {
      return next(new AppError('Comment content is required', 400));
    }

    if (!['blog', 'activity'].includes(relatedType)) {
      return next(new AppError('Invalid related type', 400));
    }

    if (!relatedId || !mongoose.Types.ObjectId.isValid(relatedId)) {
      return next(new AppError('Invalid related ID', 400));
    }

    // Verify that the related item exists
    if (relatedType === 'blog') {
      const blog = await Blog.findById(relatedId);
      if (!blog) {
        return next(new AppError('Blog not found', 404));
      }
    } else if (relatedType === 'activity') {
      const activity = await Activity.findById(relatedId);
      if (!activity) {
        return next(new AppError('Activity not found', 404));
      }
    }

    // If parentComment is provided, verify it exists
    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return next(new AppError('Invalid parent comment ID', 400));
      }
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return next(new AppError('Parent comment not found', 404));
      }
      // Ensure parent comment is for the same related item
      if (parent.relatedType !== relatedType || parent.relatedId.toString() !== relatedId) {
        return next(new AppError('Parent comment must be for the same item', 400));
      }
    }

    const comment = await Comment.create({
      user: userId,
      content: content.trim(),
      relatedType,
      relatedId,
      parentComment: parentComment || undefined,
      likes: [],
      isEdited: false,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'email role')
      .populate('parentComment')
      .select('-__v');

    res.status(201).json({
      success: true,
      data: populatedComment,
      message: 'Yorum başarıyla eklendi',
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { relatedType, relatedId, page = 1, limit = 20 } = req.query;

    if (!relatedType || !['blog', 'activity'].includes(relatedType as string)) {
      return next(new AppError('Related type is required and must be blog or activity', 400));
    }

    if (!relatedId || !mongoose.Types.ObjectId.isValid(relatedId as string)) {
      return next(new AppError('Valid related ID is required', 400));
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = {
      relatedType,
      relatedId,
      parentComment: { $exists: false }, // Only top-level comments
    };

    const [comments, totalCount] = await Promise.all([
      Comment.find(query)
        .populate('user', 'email role')
        .populate({
          path: 'likes',
          select: 'email',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Comment.countDocuments(query),
    ]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'email role')
          .sort({ createdAt: 1 })
          .select('-__v')
          .limit(5); // Limit replies per comment

        return {
          ...comment.toObject(),
          replies,
          replyCount: await Comment.countDocuments({ parentComment: comment._id }),
        };
      })
    );

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: commentsWithReplies,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid comment ID', 400));
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    // Only comment owner can update
    if (comment.user.toString() !== userId) {
      return next(new AppError('Access denied', 403));
    }

    if (!content || content.trim().length === 0) {
      return next(new AppError('Comment content is required', 400));
    }

    comment.content = content.trim();
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('user', 'email role')
      .select('-__v');

    res.json({
      success: true,
      data: updatedComment,
      message: 'Yorum güncellendi',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid comment ID', 400));
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    // Only comment owner or admin can delete
    if (comment.user.toString() !== userId && role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    // Delete all replies first
    await Comment.deleteMany({ parentComment: id });

    // Delete the comment
    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Yorum silindi',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid comment ID', 400));
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const likesArray = comment.likes as mongoose.Types.ObjectId[];

    if (likesArray.some(like => like.toString() === userId)) {
      // Unlike
      comment.likes = likesArray.filter(like => like.toString() !== userId);
    } else {
      // Like
      comment.likes.push(userObjectId);
    }

    await comment.save();

    res.json({
      success: true,
      data: {
        likes: comment.likes.length,
        isLiked: comment.likes.some(like => like.toString() === userId),
      },
    });
  } catch (error) {
    next(error);
  }
};

