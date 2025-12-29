import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityCompletion extends Document {
  activity: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  completedAt: Date;
  notes?: string;
  rating?: number; // 1-5
  createdAt: Date;
}

const ActivityCompletionSchema = new Schema<IActivityCompletion>(
  {
    activity: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

ActivityCompletionSchema.index({ activity: 1, client: 1 });

export const ActivityCompletion = mongoose.model<IActivityCompletion>('ActivityCompletion', ActivityCompletionSchema);

