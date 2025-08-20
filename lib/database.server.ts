import mongoose from "mongoose";
import clientPromise from "./mongodb";
import User, { IUser } from "../models/User";
import UserAiAssistant, { IUserAiAssistant } from "../models/UserAiAssistant";
import Message from "@/models/Message";

// Cache for database connections and user data
let isConnected = false;
const userCache = new Map<string, { user: IUser; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Connect to MongoDB with connection pooling
export async function connectToDatabase() {
  try {
    if (isConnected) {
      return { client: await clientPromise, db: (await clientPromise).db() };
    }

    const client = await clientPromise;
    const db = client.db();

    // Connect Mongoose to the same database with optimized settings
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!, {
        maxPoolSize: 20, // Increased connection pool size
        serverSelectionTimeoutMS: 3000, // Reduced timeout
        socketTimeoutMS: 30000, // Reduced socket timeout
        bufferCommands: false, // Disable mongoose buffering
        autoIndex: false, // Disable auto-indexing in production
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      });
    }

    isConnected = true;
    return { client, db };
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
}

// Cache management
function getCachedUser(email: string): IUser | null {
  const cached = userCache.get(email);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  userCache.delete(email);
  return null;
}

function setCachedUser(email: string, user: IUser) {
  userCache.set(email, { user, timestamp: Date.now() });
}

function clearUserCache(email?: string) {
  if (email) {
    userCache.delete(email);
  } else {
    userCache.clear();
  }
}

// User operations
export const userOperations = {
  // Create or get user
  async createUser(
    email: string,
    name: string,
    picture: string
  ): Promise<IUser> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    // Check cache first
    const cachedUser = getCachedUser(email);
    if (cachedUser) {
      return cachedUser;
    }

    let user = (await User.findOne({ email }).lean().exec()) as IUser | null;

    if (!user) {
      const userData = {
        name,
        email,
        picture,
        credits: 5000, // Free tier starts with 5,000 tokens
        monthlyCredits: 5000, // Track monthly allocation
        lastResetDate: new Date().toISOString(), // Track when tokens were last reset
        totalUsage: 0, // Track total tokens used
        monthlyUsage: 0, // Track monthly usage
      };

      user = (await User.create(userData)) as IUser;
    }

    // Cache the user
    setCachedUser(email, user);
    return user;
  },

  // Get user by email with caching
  async getUser(email: string): Promise<IUser | null> {
    // Check cache first
    const cachedUser = getCachedUser(email);
    if (cachedUser) {
      return cachedUser;
    }

    // Ensure database connection
    await connectToDatabase();

    const user = (await User.findOne({ email }).lean().exec()) as IUser | null;

    if (user) {
      setCachedUser(email, user);
    }

    return user;
  },

  // Update user tokens with subscription support
  async updateUserTokens(
    userId: string,
    tokensUsed: number,
    subscriptionId?: string
  ): Promise<IUser | null> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    const currentUser = (await User.findById(userId)
      .lean()
      .exec()) as IUser | null;
    if (!currentUser) return null;

    // Check if we need to reset monthly tokens
    const now = new Date();
    const lastReset = new Date(currentUser.lastResetDate || now);
    const shouldReset =
      now.getMonth() !== lastReset.getMonth() ||
      now.getFullYear() !== lastReset.getFullYear();

    let newCredits = currentUser.credits || 5000;
    let newMonthlyCredits = currentUser.monthlyCredits || 5000;
    let newLastResetDate = currentUser.lastResetDate || now.toISOString();
    let newMonthlyUsage = currentUser.monthlyUsage || 0;
    let newTotalUsage = currentUser.totalUsage || 0;

    // Reset monthly tokens if it's a new month
    if (shouldReset) {
      newMonthlyCredits = currentUser.orderId ? 100000 : 5000; // Pro plan (100k) or Free tier (5k)
      newLastResetDate = now.toISOString();
      newMonthlyUsage = 0;
      newCredits = newMonthlyCredits;
    }

    // If this is a subscription upgrade (subscriptionId provided), set to Pro plan
    if (subscriptionId) {
      newMonthlyCredits = 100000; // Pro plan allocation
      newCredits = 100000; // Set credits to Pro plan allocation
    }

    // Update usage tracking
    if (tokensUsed) {
      newMonthlyUsage += tokensUsed;
      newTotalUsage += tokensUsed;

      // Ensure credits don't go below 0
      newCredits = Math.max(0, newCredits - tokensUsed);
    }

    const updateData: any = {
      credits: newCredits,
      monthlyCredits: newMonthlyCredits,
      lastResetDate: newLastResetDate,
      monthlyUsage: newMonthlyUsage,
      totalUsage: newTotalUsage,
    };

    // Add subscription ID if provided
    if (subscriptionId) {
      updateData.orderId = subscriptionId;
    }

    const updatedUser = (await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    })
      .lean()
      .exec()) as IUser | null;

    // Update cache
    if (updatedUser) {
      setCachedUser(updatedUser.email, updatedUser);
    }

    return updatedUser;
  },

  // Get all users (for admin/testing purposes)
  async getAllUsers(): Promise<IUser[]> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    return (await User.find({}).lean().exec()) as unknown as IUser[];
  },

  // Cancel user subscription
  async cancelUserSubscription(userId: string): Promise<IUser | null> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    const updatedUser = (await User.findByIdAndUpdate(
      userId,
      {
        $unset: { orderId: "" }, // Remove the orderId field completely
        credits: 5000, // Reset to free tier tokens
        monthlyCredits: 5000, // Reset monthly allocation
      },
      { new: true }
    )
      .lean()
      .exec()) as IUser | null;

    // Update cache
    if (updatedUser) {
      setCachedUser(updatedUser.email, updatedUser);
    }

    return updatedUser;
  },
};

// User AI Assistant operations
export const userAiAssistantOperations = {
  // Insert selected assistants
  async insertSelectedAssistants(
    records: any[],
    userId: string
  ): Promise<string[]> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    const insertedIds: string[] = [];

    // Use bulk operations for better performance
    const bulkOps = records.map((record) => ({
      insertOne: {
        document: {
          id: record.id,
          name: record.name || "",
          title: record.title || "",
          image: record.image || "",
          instruction: record.instruction || "",
          userInstruction: record.userInstruction || "",
          sampleQuestions: Array.isArray(record.sampleQuestions)
            ? record.sampleQuestions
                .filter((q: any) => q !== undefined && q !== null)
                .map((q: any) => String(q))
            : [],
          aiModelId: record.aiModelId || "deepseek/deepseek-coder-33b-instruct",
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
    }));

    const result = await UserAiAssistant.bulkWrite(bulkOps);

    // Handle the insertedIds properly - it's an object with numeric keys
    if (result.insertedIds && typeof result.insertedIds === "object") {
      const ids = Object.values(result.insertedIds).map((id: any) =>
        id.toString()
      );
      return ids;
    }

    // Fallback if insertedIds is not available
    return [];
  },

  // Get all user assistants with optimized query
  async getAllUserAssistants(userId: string): Promise<IUserAiAssistant[]> {
    try {
      // Only connect if not already connected
      if (!isConnected) {
        await connectToDatabase();
      }

      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error(`Invalid user ID format: ${userId}`);
      }

      // Convert string userId to ObjectId
      const userObjectId = new mongoose.Types.ObjectId(userId);

      const assistants = (await UserAiAssistant.find({ userId: userObjectId })
        .select(
          "id name title image instruction userInstruction sampleQuestions aiModelId createdAt userId"
        )
        .sort({ createdAt: -1 })
        .lean()
        .exec()) as unknown as IUserAiAssistant[];

      return assistants;
    } catch (error) {
      console.error("Error in getAllUserAssistants:", error);
      throw error;
    }
  },

  // Update user assistant
  async updateUserAssistant(
    assistantId: string,
    userInstruction: string,
    aiModelId: string
  ): Promise<IUserAiAssistant | null> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    const result = (await UserAiAssistant.findByIdAndUpdate(
      assistantId,
      {
        aiModelId,
        userInstruction,
      },
      { new: true }
    )
      .lean()
      .exec()) as IUserAiAssistant | null;

    return result;
  },

  // Delete user assistant
  async deleteUserAssistant(assistantId: string): Promise<void> {
    // Only connect if not already connected
    if (!isConnected) {
      await connectToDatabase();
    }

    await UserAiAssistant.findByIdAndDelete(assistantId);
  },
};

// Message operations
export const messageOperations = {
  // Save a new message
  async saveMessage(
    userId: string,
    assistantId: string,
    role: "user" | "assistant",
    content: string,
    tokensUsed?: number,
    modelUsed?: string
  ) {
    try {
      // Only connect if not already connected
      if (!isConnected) {
        await connectToDatabase();
      }

      const message = new Message({
        userId: new mongoose.Types.ObjectId(userId),
        assistantId: new mongoose.Types.ObjectId(assistantId),
        role,
        content,
        tokensUsed,
        modelUsed,
      });
      return await message.save();
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  },

  // Get messages for a specific assistant
  async getMessagesByAssistant(
    userId: string,
    assistantId: string,
    limit = 50
  ) {
    try {
      // Only connect if not already connected
      if (!isConnected) {
        await connectToDatabase();
      }

      return await Message.find({
        userId: new mongoose.Types.ObjectId(userId),
        assistantId: new mongoose.Types.ObjectId(assistantId),
      })
        .sort({ timestamp: 1 })
        .limit(limit)
        .lean()
        .exec();
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  },

  // Get recent messages for a user
  async getRecentMessages(userId: string, limit = 20) {
    try {
      // Only connect if not already connected
      if (!isConnected) {
        await connectToDatabase();
      }

      return await Message.find({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate("assistantId", "name title image")
        .lean()
        .exec();
    } catch (error) {
      console.error("Error getting recent messages:", error);
      throw error;
    }
  },

  // Delete messages for an assistant
  async deleteMessagesByAssistant(userId: string, assistantId: string) {
    try {
      // Only connect if not already connected
      if (!isConnected) {
        await connectToDatabase();
      }

      return await Message.deleteMany({
        userId: new mongoose.Types.ObjectId(userId),
        assistantId: new mongoose.Types.ObjectId(assistantId),
      });
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw error;
    }
  },
};
