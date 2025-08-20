import mongoose, { Schema, Document } from "mongoose";

export interface IUserAiAssistant extends Document {
  id: number;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: any[];
  userId: mongoose.Types.ObjectId;
  aiModelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserAiAssistantSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    instruction: {
      type: String,
      required: true,
    },
    userInstruction: {
      type: String,
      required: true,
    },
    sampleQuestions: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aiModelId: {
      type: String,
      default: "deepseek/deepseek-coder-33b-instruct",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserAiAssistantSchema.index({ userId: 1 });
UserAiAssistantSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.UserAiAssistant ||
  mongoose.model<IUserAiAssistant>("UserAiAssistant", UserAiAssistantSchema);
