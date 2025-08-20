import axios, { AxiosInstance } from "axios";
import { secureStorage } from "./secureStorage";
import { logger } from "./logger";

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = secureStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logger.error("API request error", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle user authentication failures
    if (error.response?.status === 401) {
      const isUserAuthFailure =
        error.response?.data?.error === "Unauthorized. Please sign in.";

      if (isUserAuthFailure) {
        logger.warn("User authentication failed, redirecting to sign-in");
        secureStorage.clearUser();
        window.location.href = "/sign-in";
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // AI model
  getAIResponse: (data: {
    provider: string;
    userInput: string;
    aiResp?: string;
  }) => apiClient.post("/openRouter-ai-model", data),

  // Subscription management
  createSubscription: () => apiClient.post("/create-subscription"),

  verifyPayment: (data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => apiClient.post("/verify-payment", data),

  cancelSubscription: () => apiClient.post("/cancel-subscription"),
};

// Export the client for custom requests
export { apiClient };
