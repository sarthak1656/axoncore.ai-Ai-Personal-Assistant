import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { userOperations } from "@/lib/database.server";
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

    // Check if user has an active subscription
    if (!user.orderId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    try {
      // Cancel subscription in Razorpay
      const subscription = await razorpay.subscriptions.cancel(user.orderId, {
        cancel_at_cycle_end: 1, // Cancel at the end of current billing cycle
      });

      logger.info("Razorpay subscription cancelled", {
        subscriptionId: user.orderId,
        userId: user._id,
        email: user.email,
        status: subscription.status,
      });

      // Reset user to free plan
      const updatedUser = await userOperations.cancelUserSubscription(user._id);

      if (!updatedUser) {
        logger.error("Failed to reset user after subscription cancellation", {
          userId: user._id,
        });
        return NextResponse.json(
          { error: "Failed to cancel subscription" },
          { status: 500 }
        );
      }

      logger.info("User reset to free plan after subscription cancellation", {
        userId: user._id,
        email: user.email,
        newCredits: updatedUser.credits,
        newMonthlyCredits: updatedUser.monthlyCredits,
        orderId: updatedUser.orderId, // Check if orderId is actually removed
      });

      return NextResponse.json({
        success: true,
        message:
          "Subscription cancelled successfully. You will continue to have Pro access until the end of your current billing cycle.",
        user: updatedUser,
      });
    } catch (razorpayError: any) {
      logger.error("Razorpay cancellation failed", razorpayError);

      // If subscription is already cancelled, just reset the user
      if (
        razorpayError.error?.code === "BAD_REQUEST_ERROR" &&
        razorpayError.error?.description?.includes("cancelled")
      ) {
        logger.info(
          "Subscription already cancelled, resetting user to free plan",
          {
            subscriptionId: user.orderId,
            userId: user._id,
          }
        );

        const updatedUser = await userOperations.cancelUserSubscription(
          user._id
        );

        if (updatedUser) {
          return NextResponse.json({
            success: true,
            message:
              "Subscription already cancelled. You have been reset to the free plan.",
            user: updatedUser,
          });
        }
      }

      return NextResponse.json(
        { error: "Failed to cancel subscription" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    logger.error("Subscription cancellation error", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
