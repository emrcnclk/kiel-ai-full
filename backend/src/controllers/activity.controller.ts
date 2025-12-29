import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware';
import { Activity } from '../models/Activity.model';
import { ActivityCompletion } from '../models/ActivityCompletion.model';
import { AppError } from '../middleware/errorHandler';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const createdBy = req.user?.id;
    if (!createdBy) {
      return next(new AppError('Unauthorized', 401));
    }

    const activity = await Activity.create({
      ...req.body,
      createdBy,
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, age, difficulty, createdBy, page, limit } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (createdBy) {
      if (createdBy === 'me' && req.user?.id) {
        query.createdBy = req.user.id;
      } else {
        if (createdBy && !isValidObjectId(createdBy as string)) {
          return next(new AppError('Invalid createdBy ID', 400));
        }
        query.createdBy = createdBy;
      }
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

    // Get activities with pagination
    let activitiesQuery = Activity.find(query)
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    // Filter by age if provided (before pagination for accurate count)
    if (age) {
      const ageNum = parseInt(age as string);
      if (isNaN(ageNum)) {
        return next(new AppError('Invalid age parameter', 400));
      }
      // Note: Age filtering happens after query, so we need to handle it differently
      // For now, we'll get all and filter, but this could be optimized
    }

    // Get total count (before age filtering for accurate pagination)
    let activities = await activitiesQuery;
    
    // Filter by age if provided
    if (age) {
      const ageNum = parseInt(age as string);
      activities = activities.filter(
        activity => ageNum >= activity.ageRange.min && ageNum <= activity.ageRange.max
      );
    }

    const totalCount = activities.length;
    
    // Apply pagination after age filtering
    const paginatedActivities = activities.slice(skip, skip + pageSize);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    res.json({
      success: true,
      data: paginatedActivities,
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

export const getActivityById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid activity ID', 400));
    }

    const activity = await Activity.findById(id).populate('createdBy', 'email');

    if (!activity) {
      return next(new AppError('Activity not found', 404));
    }

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid activity ID', 400));
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return next(new AppError('Activity not found', 404));
    }

    // Check ownership or admin
    if (activity.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    Object.assign(activity, req.body);
    await activity.save();

    res.json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid activity ID', 400));
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return next(new AppError('Activity not found', 404));
    }

    // Check ownership or admin
    if (activity.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      return next(new AppError('Access denied', 403));
    }

    await activity.deleteOne();
    res.json({ success: true, message: 'Activity deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const completeActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user?.id;

    if (!clientId) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!isValidObjectId(id)) {
      return next(new AppError('Invalid activity ID', 400));
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return next(new AppError('Activity not found', 404));
    }

    // Check if already completed
    const existing = await ActivityCompletion.findOne({
      activity: id,
      client: clientId,
    });

    if (existing) {
      return next(new AppError('Activity already completed', 400));
    }

    const completion = await ActivityCompletion.create({
      activity: id,
      client: clientId,
      notes: req.body.notes,
      rating: req.body.rating,
    });

    res.status(201).json({ success: true, data: completion });
  } catch (error) {
    next(error);
  }
};

export const getCompletedActivities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clientId = req.user?.id;

    if (!clientId) {
      return next(new AppError('Unauthorized', 401));
    }

    const completions = await ActivityCompletion.find({ client: clientId })
      .populate('activity')
      .sort({ completedAt: -1 });

    res.json({ success: true, data: completions });
  } catch (error) {
    next(error);
  }
};

