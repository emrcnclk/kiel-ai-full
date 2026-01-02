import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { ActivityCompletion } from '../models/ActivityCompletion.model';
import { Activity } from '../models/Activity.model';
import { Blog } from '../models/Blog.model';
import { Appointment } from '../models/Appointment.model';
import { User } from '../models/User.model';
import mongoose from 'mongoose';

// Helper function to get date range
const getDateRange = (period: string) => {
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
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days default
  }

  return { startDate, endDate: now };
};

// Client Statistics
export const getClientStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clientId = req.user?.id;
    const { period = 'month' } = req.query;

    if (!clientId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { startDate, endDate } = getDateRange(period as string);

    // Activity completion stats
    const completions = await ActivityCompletion.find({
      client: clientId,
      completedAt: { $gte: startDate, $lte: endDate },
    }).populate('activity');

    // Group by date
    const dailyCompletions: { [key: string]: number } = {};
    completions.forEach((completion) => {
      const date = new Date(completion.completedAt).toISOString().split('T')[0];
      dailyCompletions[date] = (dailyCompletions[date] || 0) + 1;
    });

    // Group by category
    const categoryStats: { [key: string]: number } = {};
    completions.forEach((completion: any) => {
      if (completion.activity?.category) {
        categoryStats[completion.activity.category] = (categoryStats[completion.activity.category] || 0) + 1;
      }
    });

    // Group by difficulty
    const difficultyStats: { [key: string]: number } = {};
    completions.forEach((completion: any) => {
      if (completion.activity?.difficulty) {
        difficultyStats[completion.activity.difficulty] = (difficultyStats[completion.activity.difficulty] || 0) + 1;
      }
    });

    // Average rating
    const ratings = completions.filter((c: any) => c.rating).map((c: any) => c.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length
      : 0;

    // Total activities completed
    const totalCompleted = completions.length;

    // Streak calculation (consecutive days with at least one completion)
    const uniqueDates = new Set(
      completions.map((c) => new Date(c.completedAt).toISOString().split('T')[0])
    );
    const sortedDates = Array.from(uniqueDates).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;

    for (const date of sortedDates) {
      if (date === checkDate || date === new Date(new Date(checkDate).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        totalCompleted,
        averageRating: Math.round(averageRating * 10) / 10,
        streak,
        dailyCompletions: Object.entries(dailyCompletions).map(([date, count]) => ({ date, count })),
        categoryStats: Object.entries(categoryStats).map(([category, count]) => ({ category, count })),
        difficultyStats: Object.entries(difficultyStats).map(([difficulty, count]) => ({ difficulty, count })),
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Expert Statistics
export const getExpertStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expertId = req.user?.id;
    const { period = 'month' } = req.query;

    if (!expertId) {
      return next(new AppError('Unauthorized', 401));
    }

    const { startDate, endDate } = getDateRange(period as string);

    // Blog stats
    const blogs = await Blog.find({
      author: expertId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const totalBlogViews = blogs.reduce((sum, blog) => sum + blog.views, 0);
    const blogViewsByDate: { [key: string]: number } = {};
    blogs.forEach((blog) => {
      const date = new Date(blog.createdAt).toISOString().split('T')[0];
      blogViewsByDate[date] = (blogViewsByDate[date] || 0) + blog.views;
    });

    // Activity stats
    const activities = await Activity.find({
      createdBy: expertId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const activityCompletions = await ActivityCompletion.find({
      activity: { $in: activities.map((a) => a._id) },
    }).populate('activity');

    const activityCompletionsByDate: { [key: string]: number } = {};
    activityCompletions.forEach((completion: any) => {
      const date = new Date(completion.completedAt).toISOString().split('T')[0];
      activityCompletionsByDate[date] = (activityCompletionsByDate[date] || 0) + 1;
    });

    // Appointment stats
    const appointments = await Appointment.find({
      expert: expertId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const appointmentsByStatus: { [key: string]: number } = {};
    appointments.forEach((appointment) => {
      appointmentsByStatus[appointment.status] = (appointmentsByStatus[appointment.status] || 0) + 1;
    });

    // Most popular activities
    const activityPopularity: { [key: string]: number } = {};
    activityCompletions.forEach((completion: any) => {
      const activityId = completion.activity?._id?.toString();
      if (activityId) {
        activityPopularity[activityId] = (activityPopularity[activityId] || 0) + 1;
      }
    });

    const topActivities = Object.entries(activityPopularity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activityId, count]) => {
        const activity = activities.find((a) => a._id.toString() === activityId);
        return {
          activityId,
          title: activity?.title || 'Unknown',
          completions: count,
        };
      });

    res.json({
      success: true,
      data: {
        blogs: {
          total: blogs.length,
          totalViews: totalBlogViews,
          viewsByDate: Object.entries(blogViewsByDate).map(([date, views]) => ({ date, views })),
        },
        activities: {
          total: activities.length,
          totalCompletions: activityCompletions.length,
          completionsByDate: Object.entries(activityCompletionsByDate).map(([date, count]) => ({ date, count })),
          topActivities,
        },
        appointments: {
          total: appointments.length,
          byStatus: Object.entries(appointmentsByStatus).map(([status, count]) => ({ status, count })),
        },
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Statistics
export const getAdminStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = getDateRange(period as string);

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const usersByRole: { [key: string]: number } = {};
    const allUsers = await User.find();
    allUsers.forEach((user) => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });

    // Blog stats
    const totalBlogs = await Blog.countDocuments();
    const newBlogs = await Blog.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalBlogViews = (await Blog.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]))[0]?.totalViews || 0;

    // Activity stats
    const totalActivities = await Activity.countDocuments();
    const newActivities = await Activity.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });
    const totalCompletions = await ActivityCompletion.countDocuments();

    // Appointment stats
    const totalAppointments = await Appointment.countDocuments();
    const newAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          new: newUsers,
          byRole: Object.entries(usersByRole).map(([role, count]) => ({ role, count })),
        },
        blogs: {
          total: totalBlogs,
          new: newBlogs,
          totalViews,
        },
        activities: {
          total: totalActivities,
          new: newActivities,
          totalCompletions,
        },
        appointments: {
          total: totalAppointments,
          new: newAppointments,
        },
        period,
      },
    });
  } catch (error) {
    next(error);
  }
};

