import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthLog extends Document {
  user: mongoose.Types.ObjectId;
  date: Date;
  mood?: string; // 'very_happy', 'happy', 'neutral', 'sad', 'very_sad'
  sleepHours?: number;
  appetite?: string; // 'good', 'normal', 'poor'
  energyLevel?: number; // 1-10
  notes?: string;
  symptoms?: string[];
  medications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HealthLogSchema = new Schema<IHealthLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'],
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    appetite: {
      type: String,
      enum: ['good', 'normal', 'poor'],
    },
    energyLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    symptoms: [{
      type: String,
      trim: true,
    }],
    medications: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

HealthLogSchema.index({ user: 1, date: -1 });
HealthLogSchema.index({ user: 1, date: 1 }, { unique: true }); // One log per user per day

export const HealthLog = mongoose.model<IHealthLog>('HealthLog', HealthLogSchema);

