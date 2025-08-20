import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;
  assistantId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  modelUsed?: string;
}

const MessageSchema = new Schema<IMessage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assistantId: {
    type: Schema.Types.ObjectId,
    ref: "UserAiAssistant",
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "assistant"],
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
  tokensUsed: {
    type: Number,
    default: 0,
  },
  modelUsed: {
    type: String,
    default: "",
  },
});

// Index for efficient querying
MessageSchema.index({ userId: 1, assistantId: 1, timestamp: -1 });
MessageSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
