import mongoose, { Document, Schema } from 'mongoose';

export enum FeedbackType {
  GENERAL = 'general',
  ACTIVITY = 'activity',
  APPOINTMENT = 'appointment',
  PLATFORM = 'platform',
  SUGGESTION = 'suggestion',
}

export enum FeedbackRating {
  VERY_POOR = 1,
  POOR = 2,
  AVERAGE = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  type: FeedbackType;
  title: string;
  message: string;
  rating?: FeedbackRating;
  relatedId?: mongoose.Types.ObjectId; // Activity, Appointment, etc.
  isAnonymous: boolean;
  status: 'pending' | 'reviewed' | 'resolved';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(FeedbackType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    rating: {
      type: Number,
      enum: Object.values(FeedbackRating),
      min: 1,
      max: 5,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminResponse: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.index({ user: 1, createdAt: -1 });
FeedbackSchema.index({ type: 1, status: 1 });
FeedbackSchema.index({ relatedId: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

