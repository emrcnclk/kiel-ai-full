import mongoose, { Document, Schema } from 'mongoose';

export interface IExpertProfile extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  specialization: string[];
  experience: number;
  certifications: string[];
  bio: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpertProfileSchema = new Schema<IExpertProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    specialization: [{
      type: String,
      trim: true,
    }],
    experience: {
      type: Number,
      default: 0,
    },
    certifications: [{
      type: String,
      trim: true,
    }],
    bio: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ExpertProfile = mongoose.model<IExpertProfile>('ExpertProfile', ExpertProfileSchema);

