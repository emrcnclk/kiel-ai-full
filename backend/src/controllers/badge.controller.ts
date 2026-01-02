import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { Badge } from '../models/Badge.model';
import { checkAndAwardBadges } from '../services/badge.service';

// Get user's badges
export const getUserBadges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const badges = await Badge.find({ user: userId })
      .sort({ earnedAt: -1 });

    // Separate earned and progress badges
    const earnedBadges = badges.filter(b => b.earnedAt.getTime() > 0);
    const progressBadges = badges.filter(b => b.earnedAt.getTime() === 0);

    res.json({
      success: true,
      data: {
        earned: earnedBadges,
        inProgress: progressBadges,
        total: earnedBadges.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get badge statistics
export const getBadgeStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const badges = await Badge.find({ user: userId });
    const earnedBadges = badges.filter(b => b.earnedAt.getTime() > 0);

    // Group by type
    const badgesByType: { [key: string]: number } = {};
    earnedBadges.forEach((badge) => {
      badgesByType[badge.type] = (badgesByType[badge.type] || 0) + 1;
    });

    // Get recent badges (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBadges = earnedBadges.filter(
      (badge) => badge.earnedAt >= sevenDaysAgo
    );

    res.json({
      success: true,
      data: {
        total: earnedBadges.length,
        byType: Object.entries(badgesByType).map(([type, count]) => ({ type, count })),
        recent: recentBadges.length,
        recentBadges: recentBadges.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Manually check for new badges
export const checkBadges = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const awardedBadges = await checkAndAwardBadges(userId);

    res.json({
      success: true,
      data: {
        newBadges: awardedBadges,
        count: awardedBadges.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

