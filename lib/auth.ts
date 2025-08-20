import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types";
import { logger } from "./logger";

// Authentication middleware for API routes
export async function authenticateRequest(
  req: NextRequest
): Promise<User | null> {
  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      logger.warn("No authorization token provided");
      return null;
    }

    // For now, we'll validate the token by checking if it's a valid Google access token
    // In production, you should implement proper JWT validation
    const userInfo = await validateGoogleToken(token);

    if (!userInfo) {
      logger.warn("Invalid authorization token");
      return null;
    }

    return userInfo;
  } catch (error) {
    logger.error("Authentication error", error);
    return null;
  }
}

// Validate Google access token and get user from database
async function validateGoogleToken(token: string): Promise<User | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`
    );

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();

    // Get the actual user from database with proper _id
    const { userOperations } = await import("./database.server");
    const dbUser = await userOperations.getUser(userData.email);

    if (!dbUser) {
      logger.warn("User not found in database", { email: userData.email });
      return null;
    }

    return dbUser;
  } catch (error) {
    logger.error("Google token validation error", error);
    return null;
  }
}

// Rate limiting utility
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

// Secure response helper
export function createSecureResponse(
  data: any,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Security-Policy": "default-src 'self'",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
    },
  });
}

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400
): NextResponse {
  return createSecureResponse({ success: false, error: message }, status);
}
