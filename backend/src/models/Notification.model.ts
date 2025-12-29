import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  APPOINTMENT_REQUEST = 'appointment_request',
  APPOINTMENT_APPROVED = 'appointment_approved',
  APPOINTMENT_REJECTED = 'appointment_rejected',
  NEW_MESSAGE = 'new_message',
  NEW_BLOG_POST = 'new_blog_post',
  AI_SUMMARY_READY = 'ai_summary_ready',
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: mongoose.Types.ObjectId; // ID of related entity (appointment, message, etc.)
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

