import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { HealthLog } from '../models/HealthLog.model';
import mongoose from 'mongoose';

export const createOrUpdateHealthLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { date, mood, sleepHours, appetite, energyLevel, notes, symptoms, medications } = req.body;

    // Use provided date or today
    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Validate fields
    if (mood && !['very_happy', 'happy', 'neutral', 'sad', 'very_sad'].includes(mood)) {
      return next(new AppError('Invalid mood value', 400));
    }

    if (sleepHours !== undefined && (sleepHours < 0 || sleepHours > 24)) {
      return next(new AppError('Sleep hours must be between 0 and 24', 400));
    }

    if (appetite && !['good', 'normal', 'poor'].includes(appetite)) {
      return next(new AppError('Invalid appetite value', 400));
    }

    if (energyLevel !== undefined && (energyLevel < 1 || energyLevel > 10)) {
      return next(new AppError('Energy level must be between 1 and 10', 400));
    }

    // Find existing log for this date or create new one
    const existingLog = await HealthLog.findOne({
      user: userId,
      date: {
        $gte: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()),
        $lt: new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate() + 1),
      },
    });

    let healthLog;
    if (existingLog) {
      // Update existing log
      if (mood !== undefined) existingLog.mood = mood;
      if (sleepHours !== undefined) existingLog.sleepHours = sleepHours;
      if (appetite !== undefined) existingLog.appetite = appetite;
      if (energyLevel !== undefined) existingLog.energyLevel = energyLevel;
      if (notes !== undefined) existingLog.notes = notes?.trim();
      if (symptoms !== undefined) existingLog.symptoms = symptoms;
      if (medications !== undefined) existingLog.medications = medications;
      
      await existingLog.save();
      healthLog = existingLog;
    } else {
      // Create new log
      healthLog = await HealthLog.create({
        user: userId,
        date: logDate,
        mood,
        sleepHours,
        appetite,
        energyLevel,
        notes: notes?.trim(),
        symptoms: symptoms || [],
        medications: medications || [],
      });
    }

    res.json({
      success: true,
      data: healthLog,
      message: existingLog ? 'Sağlık günlüğü güncellendi' : 'Sağlık günlüğü kaydı oluşturuldu',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new AppError('Bu tarih için zaten bir kayıt var', 400));
    }
    next(error);
  }
};

export const getHealthLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { role } = req.user || {};
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    // Only clients can see their own logs, admins can see all
    const targetUserId = role === 'admin' && req.query.userId ? req.query.userId : userId;

    if (role !== 'admin' && targetUserId !== userId) {
      return next(new AppError('Access denied', 403));
    }

    const query: any = { user: targetUserId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, totalCount] = await Promise.all([
      HealthLog.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      HealthLog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: logs,
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

export const getHealthLogById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid health log ID', 400));
    }

    const log = await HealthLog.findById(id);
    if (!log) {
      return next(new AppError('Health log not found', 404));
    }

    // Users can only see their own logs, admins can see all
    if (role !== 'admin' && log.user.toString() !== userId) {
      return next(new AppError('Access denied', 403));
    }

    res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHealthLog = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { role } = req.user || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid health log ID', 400));
    }

    const log = await HealthLog.findById(id);
    if (!log) {
      return next(new AppError('Health log not found', 404));
    }

    // Users can only delete their own logs, admins can delete all
    if (role !== 'admin' && log.user.toString() !== userId) {
      return next(new AppError('Access denied', 403));
    }

    await HealthLog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Sağlık günlüğü kaydı silindi',
    });
  } catch (error) {
    next(error);
  }
};

export const getHealthStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { role } = req.user || {};
    const { period = 'month' } = req.query;

    const targetUserId = role === 'admin' && req.query.userId ? req.query.userId : userId;

    if (role !== 'admin' && targetUserId !== userId) {
      return next(new AppError('Access denied', 403));
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const logs = await HealthLog.find({
      user: targetUserId,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    // Calculate statistics
    const moodCounts: Record<string, number> = {};
    let totalSleep = 0;
    let sleepCount = 0;
    const appetiteCounts: Record<string, number> = {};
    let totalEnergy = 0;
    let energyCount = 0;

    logs.forEach(log => {
      if (log.mood) {
        moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
      }
      if (log.sleepHours !== undefined) {
        totalSleep += log.sleepHours;
        sleepCount++;
      }
      if (log.appetite) {
        appetiteCounts[log.appetite] = (appetiteCounts[log.appetite] || 0) + 1;
      }
      if (log.energyLevel !== undefined) {
        totalEnergy += log.energyLevel;
        energyCount++;
      }
    });

    res.json({
      success: true,
      data: {
        totalLogs: logs.length,
        averageSleepHours: sleepCount > 0 ? (totalSleep / sleepCount).toFixed(1) : 0,
        averageEnergyLevel: energyCount > 0 ? (totalEnergy / energyCount).toFixed(1) : 0,
        moodDistribution: moodCounts,
        appetiteDistribution: appetiteCounts,
        logs: logs.map(log => ({
          date: log.date,
          mood: log.mood,
          sleepHours: log.sleepHours,
          appetite: log.appetite,
          energyLevel: log.energyLevel,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

