import { Badge, BadgeType } from '../models/Badge.model';
import { ActivityCompletion } from '../models/ActivityCompletion.model';
import { Activity } from '../models/Activity.model';
import mongoose from 'mongoose';

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  checkEligibility: (userId: string, metadata?: any) => Promise<boolean>;
  getProgress?: (userId: string, metadata?: any) => Promise<{ progress: number; target: number }>;
}

// Badge definitions
const badgeDefinitions: BadgeDefinition[] = [
  // Activity Completion Badges
  {
    type: BadgeType.ACTIVITY_COMPLETION,
    name: 'İlk Adım',
    description: 'İlk aktiviteyi tamamladınız!',
    icon: '🎯',
    checkEligibility: async (userId) => {
      const count = await ActivityCompletion.countDocuments({ client: userId });
      return count >= 1;
    },
  },
  {
    type: BadgeType.ACTIVITY_COMPLETION,
    name: 'Aktif Oyuncu',
    description: '5 aktivite tamamladınız!',
    icon: '🏆',
    checkEligibility: async (userId) => {
      const count = await ActivityCompletion.countDocuments({ client: userId });
      return count >= 5;
    },
  },
  {
    type: BadgeType.ACTIVITY_COMPLETION,
    name: 'Uzman Oyuncu',
    description: '10 aktivite tamamladınız!',
    icon: '⭐',
    checkEligibility: async (userId) => {
      const count = await ActivityCompletion.countDocuments({ client: userId });
      return count >= 10;
    },
  },
  {
    type: BadgeType.ACTIVITY_COMPLETION,
    name: 'Şampiyon',
    description: '25 aktivite tamamladınız!',
    icon: '👑',
    checkEligibility: async (userId) => {
      const count = await ActivityCompletion.countDocuments({ client: userId });
      return count >= 25;
    },
  },
  {
    type: BadgeType.ACTIVITY_COMPLETION,
    name: 'Efsane',
    description: '50 aktivite tamamladınız!',
    icon: '🌟',
    checkEligibility: async (userId) => {
      const count = await ActivityCompletion.countDocuments({ client: userId });
      return count >= 50;
    },
  },
  // Streak Badges
  {
    type: BadgeType.STREAK,
    name: 'Ateş Başladı',
    description: '3 gün üst üste aktivite tamamladınız!',
    icon: '🔥',
    checkEligibility: async (userId) => {
      const streak = await calculateStreak(userId);
      return streak >= 3;
    },
    getProgress: async (userId) => {
      const streak = await calculateStreak(userId);
      return { progress: Math.min((streak / 3) * 100, 100), target: 3 };
    },
  },
  {
    type: BadgeType.STREAK,
    name: 'Ateşli',
    description: '7 gün üst üste aktivite tamamladınız!',
    icon: '🔥🔥',
    checkEligibility: async (userId) => {
      const streak = await calculateStreak(userId);
      return streak >= 7;
    },
    getProgress: async (userId) => {
      const streak = await calculateStreak(userId);
      return { progress: Math.min((streak / 7) * 100, 100), target: 7 };
    },
  },
  {
    type: BadgeType.STREAK,
    name: 'Ateş Fırtınası',
    description: '14 gün üst üste aktivite tamamladınız!',
    icon: '🔥🔥🔥',
    checkEligibility: async (userId) => {
      const streak = await calculateStreak(userId);
      return streak >= 14;
    },
    getProgress: async (userId) => {
      const streak = await calculateStreak(userId);
      return { progress: Math.min((streak / 14) * 100, 100), target: 14 };
    },
  },
  {
    type: BadgeType.STREAK,
    name: 'Ateş Kralı',
    description: '30 gün üst üste aktivite tamamladınız!',
    icon: '👑🔥',
    checkEligibility: async (userId) => {
      const streak = await calculateStreak(userId);
      return streak >= 30;
    },
    getProgress: async (userId) => {
      const streak = await calculateStreak(userId);
      return { progress: Math.min((streak / 30) * 100, 100), target: 30 };
    },
  },
  // Category Master Badges
  {
    type: BadgeType.CATEGORY_MASTER,
    name: 'Otizm Uzmanı',
    description: 'Otizm Desteği kategorisinde 5 aktivite tamamladınız!',
    icon: '🧩',
    checkEligibility: async (userId) => {
      const completions = await ActivityCompletion.find({ client: userId }).populate('activity');
      const categoryCount = completions.filter(
        (c: any) => c.activity?.category === 'Otizm Desteği'
      ).length;
      return categoryCount >= 5;
    },
  },
  {
    type: BadgeType.CATEGORY_MASTER,
    name: 'Sanatçı',
    description: 'Sanat ve Yaratıcılık kategorisinde 5 aktivite tamamladınız!',
    icon: '🎨',
    checkEligibility: async (userId) => {
      const completions = await ActivityCompletion.find({ client: userId }).populate('activity');
      const categoryCount = completions.filter(
        (c: any) => c.activity?.category === 'Sanat ve Yaratıcılık'
      ).length;
      return categoryCount >= 5;
    },
  },
  // Difficulty Challenge Badges
  {
    type: BadgeType.DIFFICULTY_CHALLENGE,
    name: 'Zorluk Avcısı',
    description: 'Zor seviye bir aktivite tamamladınız!',
    icon: '💪',
    checkEligibility: async (userId) => {
      const completions = await ActivityCompletion.find({ client: userId }).populate('activity');
      return completions.some((c: any) => c.activity?.difficulty === 'hard');
    },
  },
];

// Calculate current streak
async function calculateStreak(userId: string): Promise<number> {
  const completions = await ActivityCompletion.find({ client: userId })
    .sort({ completedAt: -1 })
    .limit(30);

  if (completions.length === 0) return 0;

  const uniqueDates = new Set(
    completions.map((c) => new Date(c.completedAt).toISOString().split('T')[0])
  );
  const sortedDates = Array.from(uniqueDates).sort().reverse();
  
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;

  for (const date of sortedDates) {
    const dateObj = new Date(date);
    const checkDateObj = new Date(checkDate);
    const diffDays = Math.floor((checkDateObj.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0 || diffDays === 1) {
      streak++;
      checkDate = date;
    } else {
      break;
    }
  }

  return streak;
}

// Check and award badges
export async function checkAndAwardBadges(userId: string): Promise<any[]> {
  const awardedBadges: any[] = [];

  for (const badgeDef of badgeDefinitions) {
    // Check if user already has this badge
    const existingBadge = await Badge.findOne({
      user: userId,
      type: badgeDef.type,
      name: badgeDef.name,
    });

    if (existingBadge) continue;

    // Check eligibility
    const isEligible = await badgeDef.checkEligibility(userId);
    
    if (isEligible) {
      // Get progress if available
      let progress: number | undefined;
      let target: number | undefined;
      
      if (badgeDef.getProgress) {
        const progressData = await badgeDef.getProgress(userId);
        progress = progressData.progress;
        target = progressData.target;
      }

      // Create badge
      const badge = await Badge.create({
        user: userId,
        type: badgeDef.type,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        progress,
        target,
      });

      awardedBadges.push(badge);
    } else if (badgeDef.getProgress) {
      // Create or update progress badge even if not earned
      const progressData = await badgeDef.getProgress(userId);
      
      const existingProgressBadge = await Badge.findOne({
        user: userId,
        type: badgeDef.type,
        name: badgeDef.name,
      });

      if (existingProgressBadge) {
        existingProgressBadge.progress = progressData.progress;
        existingProgressBadge.target = progressData.target;
        await existingProgressBadge.save();
      } else {
        await Badge.create({
          user: userId,
          type: badgeDef.type,
          name: badgeDef.name,
          description: badgeDef.description,
          icon: badgeDef.icon,
          progress: progressData.progress,
          target: progressData.target,
          earnedAt: new Date(0), // Not earned yet
        });
      }
    }
  }

  return awardedBadges;
}

