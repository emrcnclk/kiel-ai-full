import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  ageRange: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  materials?: string[];
  estimatedDuration: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    ageRange: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    materials: [{
      type: String,
      trim: true,
    }],
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);

