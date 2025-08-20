// User types
export interface User {
  _id: string;
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

// Assistant Types
export interface Assistant {
  id: number;
  _id?: string;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  aiModelId?: string;
  userId?: string;
}

// Message Types
export interface Message {
  role: "user" | "assistant";
  content: string;
}

// Razorpay types
export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Subscription Types
export interface SubscriptionData {
  subId: string;
  uid: string;
}

// Error Types
export interface ApiError {
  statusCode: number;
  error: {
    code: string;
    description: string;
  };
}

// Context Types
export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export interface AssistantContextType {
  assistants: Assistant | null;
  setAssistants: (assistant: Assistant | null) => void;
}
