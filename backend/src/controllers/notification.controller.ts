import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/Notification.model';
import { AppError } from '../middleware/errorHandler';

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { unreadOnly, page, limit } = req.query;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const query: any = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    // Pagination parameters
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 20;
    const skip = (pageNumber - 1) * pageSize;

    // Validate pagination parameters
    if (pageNumber < 1) {
      return next(new AppError('Page number must be greater than 0', 400));
    }
    if (pageSize < 1 || pageSize > 100) {
      return next(new AppError('Limit must be between 1 and 100', 400));
    }

    // Get total count for pagination metadata
    const totalCount = await Notification.countDocuments(query);

    // Get paginated notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: notifications,
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

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }

    if (notification.user.toString() !== userId) {
      return next(new AppError('Access denied', 403));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

