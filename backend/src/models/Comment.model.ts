import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  relatedType: 'blog' | 'activity';
  relatedId: mongoose.Types.ObjectId;
  parentComment?: mongoose.Types.ObjectId; // For nested comments/replies
  likes: mongoose.Types.ObjectId[]; // Users who liked this comment
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    relatedType: {
      type: String,
      enum: ['blog', 'activity'],
      required: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'relatedType',
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ relatedType: 1, relatedId: 1, createdAt: -1 });
CommentSchema.index({ user: 1 });
CommentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);

