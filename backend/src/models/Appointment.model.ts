import mongoose, { Document, Schema } from 'mongoose';

export enum AppointmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface IAppointment extends Document {
  expert: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number; // minutes
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    expert: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
      min: 15,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

AppointmentSchema.index({ expert: 1, scheduledAt: 1 });
AppointmentSchema.index({ client: 1, scheduledAt: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);

