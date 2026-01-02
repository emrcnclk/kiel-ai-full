import mongoose, { Document, Schema } from 'mongoose';

export enum BadgeType {
  ACTIVITY_COMPLETION = 'activity_completion',
  STREAK = 'streak',
  CATEGORY_MASTER = 'category_master',
  DIFFICULTY_CHALLENGE = 'difficulty_challenge',
  MILESTONE = 'milestone',
}

export interface IBadge extends Document {
  user: mongoose.Types.ObjectId;
  type: BadgeType;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  earnedAt: Date;
  progress?: number; // For progress-based badges (0-100)
  target?: number; // Target value for progress
  metadata?: {
    activityId?: mongoose.Types.ObjectId;
    category?: string;
    difficulty?: string;
    streakDays?: number;
    completionCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(BadgeType),
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
    },
    target: {
      type: Number,
    },
    metadata: {
      activityId: {
        type: Schema.Types.ObjectId,
        ref: 'Activity',
      },
      category: String,
      difficulty: String,
      streakDays: Number,
      completionCount: Number,
    },
  },
  {
    timestamps: true,
  }
);

BadgeSchema.index({ user: 1, type: 1 });
BadgeSchema.index({ user: 1, earnedAt: -1 });

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);

