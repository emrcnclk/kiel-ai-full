import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface ISchedule extends Document {
  expert: mongoose.Types.ObjectId;
  timeSlots: ITimeSlot[];
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
  },
}, { _id: false });

const ScheduleSchema = new Schema<ISchedule>(
  {
    expert: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    timeSlots: [TimeSlotSchema],
    timezone: {
      type: String,
      default: 'Europe/Istanbul',
    },
  },
  {
    timestamps: true,
  }
);

export const Schedule = mongoose.model<ISchedule>('Schedule', ScheduleSchema);

