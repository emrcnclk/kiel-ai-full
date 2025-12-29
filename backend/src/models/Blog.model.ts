import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  categories: string[];
  tags: string[];
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    categories: [{
      type: String,
      trim: true,
    }],
    tags: [{
      type: String,
      trim: true,
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);

