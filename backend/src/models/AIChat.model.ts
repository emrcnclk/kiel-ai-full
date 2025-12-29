import mongoose, { Document, Schema } from 'mongoose';

export interface IAIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IAIChat extends Document {
  user: mongoose.Types.ObjectId;
  messages: IAIChatMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AIChatMessageSchema = new Schema<IAIChatMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const AIChatSchema = new Schema<IAIChat>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messages: [AIChatMessageSchema],
    title: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

AIChatSchema.index({ user: 1, createdAt: -1 });

export const AIChat = mongoose.model<IAIChat>('AIChat', AIChatSchema);

