import mongoose, { Document, Schema } from 'mongoose';

export interface IClientProfile extends Document {
  user: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  childAge?: number;
  childInterests: string[];
  notes: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientProfileSchema = new Schema<IClientProfile>(
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
    childAge: {
      type: Number,
    },
    childInterests: [{
      type: String,
      trim: true,
    }],
    notes: {
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

export const ClientProfile = mongoose.model<IClientProfile>('ClientProfile', ClientProfileSchema);

