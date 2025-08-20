import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  picture: string;
  credits: number;
  orderId?: string;
  monthlyCredits?: number;
  lastResetDate?: string;
  totalUsage?: number;
  monthlyUsage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      default: 5000, // Default 5,000 tokens
    },
    orderId: {
      type: String,
      default: undefined,
    },
    monthlyCredits: {
      type: Number,
      default: 5000, // Track monthly allocation
    },
    lastResetDate: {
      type: String,
      default: () => new Date().toISOString(),
    },
    totalUsage: {
      type: Number,
      default: 0, // Track total tokens used
    },
    monthlyUsage: {
      type: Number,
      default: 0, // Track monthly usage
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
