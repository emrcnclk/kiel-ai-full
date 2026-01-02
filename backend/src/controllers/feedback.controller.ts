import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { Feedback, FeedbackType, FeedbackRating } from '../models/Feedback.model';
import mongoose from 'mongoose';

export const createFeedback = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { type, title, message, rating, relatedId, isAnonymous } = req.body;

    if (!type || !Object.values(FeedbackType).includes(type)) {
      return next(new AppError('Invalid feedback type', 400));
    }

    if (!title || title.trim().length === 0) {
      return next(new AppError('Title is required', 400));
    }

    if (!message || message.trim().length === 0) {
      return next(new AppError('Message is required', 400));
    }

    if (rating && !Object.values(FeedbackRating).includes(rating)) {
      return next(new AppError('Invalid rating value', 400));
    }

    const feedback = await Feedback.create({
      user: userId,
      type,
      title: title.trim(),
      message: message.trim(),
      rating,
      relatedId: relatedId && mongoose.Types.ObjectId.isValid(relatedId) ? relatedId : undefined,
      isAnonymous: isAnonymous || false,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Geri bildiriminiz başarıyla gönderildi. Teşekkür ederiz!',
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbacks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { role } = req.user || {};
    const { type, status, page = 1, limit = 10 } = req.query;

    const query: any = {};

    // Only admins can see all feedbacks, users see only their own
    if (role !== 'admin') {
      query.user = userId;
    }

    if (type && Object.values(FeedbackType).includes(type as FeedbackType)) {
      query.type = type;
    }

    if (status && ['pending', 'reviewed', 'resolved'].includes(status as string)) {
      query.status = status;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [feedbacks, totalCount] = await Promise.all([
      Feedback.find(query)
        .populate('user', 'email role')
        .populate('relatedId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Feedback.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: feedbacks,
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

export const getFeedbackById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid feedback ID', 400));
    }

    const feedback = await Feedback.findById(id)
      .populate('user', 'email role')
      .populate('relatedId');

    if (!feedback) {
      return next(new AppError('Feedback not found', 404));
    }

    // Users can only see their own feedbacks, admins can see all
    if (role !== 'admin' && feedback.user.toString() !== userId) {
      return next(new AppError('Access denied', 403));
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFeedbackStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.user || {};

    if (role !== 'admin') {
      return next(new AppError('Only admins can update feedback status', 403));
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid feedback ID', 400));
    }

    const { status, adminResponse } = req.body;

    if (status && !['pending', 'reviewed', 'resolved'].includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return next(new AppError('Feedback not found', 404));
    }

    if (status) {
      feedback.status = status as 'pending' | 'reviewed' | 'resolved';
    }

    if (adminResponse !== undefined) {
      feedback.adminResponse = adminResponse?.trim() || undefined;
    }

    await feedback.save();

    res.json({
      success: true,
      data: feedback,
      message: 'Geri bildirim durumu güncellendi',
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.user || {};

    if (role !== 'admin') {
      return next(new AppError('Only admins can view feedback statistics', 403));
    }

    const [totalFeedbacks, pendingFeedbacks, averageRating, typeStats, ratingStats] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.aggregate([
        { $match: { rating: { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
      Feedback.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: { rating: { $exists: true } } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalFeedbacks,
        pendingFeedbacks,
        averageRating: averageRating[0]?.avgRating?.toFixed(2) || 0,
        typeStats: typeStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        ratingDistribution: ratingStats.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

