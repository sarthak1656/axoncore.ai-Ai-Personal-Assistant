import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_KEY!,
  key_secret: process.env.RAZORPAY_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Validate user ID
    if (!user._id) {
      logger.error("User ID is missing", { user });
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Check if user already has an active subscription
    if (user.orderId) {
      return NextResponse.json(
        { error: "User already has an active subscription" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (
      !process.env.RAZORPAY_LIVE_KEY ||
      !process.env.RAZORPAY_SECRET_KEY ||
      !process.env.RAZORPAY_PLAN_ID
    ) {
      logger.error("Razorpay environment variables are missing");
      return NextResponse.json(
        { error: "Payment service configuration error" },
        { status: 500 }
      );
    }

    // Create subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      customer_notify: 1,
      total_count: 12, // 12 months subscription
      notes: {
        user_id: user._id,
        email: user.email,
      },
    });

    logger.info("Razorpay subscription created", {
      subscriptionId: subscription.id,
      userId: user._id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planId: process.env.RAZORPAY_PLAN_ID,
    });
  } catch (error: any) {
    logger.error("Failed to create subscription", error);

    // Handle specific Razorpay errors
    if (error.error) {
      const errorCode = error.error.code;
      const errorDescription = error.error.description;

      if (errorCode === "BAD_REQUEST_ERROR") {
        return NextResponse.json(
          { error: "Invalid subscription request. Please try again." },
          { status: 400 }
        );
      } else if (errorCode === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Payment service authentication failed" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create subscription. Please try again." },
      { status: 500 }
    );
  }
}
