import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Crown, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { api } from "@/lib/api";
import NoSSR from "@/components/NoSSR";

function Profile({
  openDialog,
  setOpenDialog,
}: {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}) {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Refresh user data from server
  const refreshUserData = async () => {
    try {
      const response = await fetch(
        `/api/users/get?email=${encodeURIComponent(user?.email || "")}`,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      if (response.ok) {
        const freshUserData = await response.json();
        setUser(freshUserData);
      }
    } catch (error) {
      logger.error("Failed to refresh user data", error);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    if (isHydrated) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        logger.info("Razorpay script loaded successfully");
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isHydrated]);

  // Create subscription and open payment modal
  const handleUpgradeToPro = async () => {
    try {
      setLoading(true);

      // Create subscription in Razorpay
      const response = await api.createSubscription();
      const subscriptionId = response?.data?.subscriptionId;

      if (!subscriptionId) {
        throw new Error("Failed to create subscription");
      }

      logger.info("Subscription created", { id: subscriptionId });

      // Open Razorpay payment modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY!,
        subscription_id: subscriptionId,
        name: "Personal AI Agent",
        description: "Pro Plan - 100,000 tokens per month",
        image: "/logo.svg",
        handler: async (response: any) => {
          if (
            response?.razorpay_payment_id &&
            response?.razorpay_subscription_id &&
            response?.razorpay_signature
          ) {
            try {
              // Verify payment
              const verifyResponse = await api.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse?.data?.success) {
                toast.success("Pro plan activated successfully!");
                await refreshUserData();
                setOpenDialog(false);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (error) {
              logger.error("Payment verification failed", error);
              toast.error(
                "Payment verification failed. Please contact support."
              );
            }
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#000000",
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      logger.error("Failed to create subscription", error);
      toast.error("Failed to create subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);

      const response = await api.cancelSubscription();

      if (response?.data?.success) {
        toast.success("Subscription cancelled successfully!");
        await refreshUserData();
        setOpenDialog(false);
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error: any) {
      logger.error("Failed to cancel subscription", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent suppressHydrationWarning>
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription asChild>
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <NoSSR>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and view usage information.
            </DialogDescription>
          </DialogHeader>

          {/* Profile Content */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {user?.picture ? (
                  <Image
                    src={user.picture}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {user?.orderId ? (
                    <>
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Pro Plan
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      Free Plan
                    </>
                  )}
                </h4>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user?.orderId
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {user?.orderId ? "Active" : "Free"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly Limit:</span>
                  <span className="font-medium">
                    {user?.monthlyCredits?.toLocaleString()} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Used This Month:</span>
                  <span>
                    {user?.monthlyUsage?.toLocaleString() || "0"} tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">
                    {Math.max(
                      0,
                      (user?.monthlyCredits || 0) - (user?.monthlyUsage || 0)
                    ).toLocaleString()}{" "}
                    tokens
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Used:</span>
                  <span>
                    {user?.totalUsage?.toLocaleString() || "0"} tokens
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Progress
                  value={
                    user
                      ? ((user.monthlyUsage || 0) /
                          (user.monthlyCredits || 1)) *
                        100
                      : 0
                  }
                  className="h-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!user?.orderId ? (
                <Button
                  onClick={handleUpgradeToPro}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Pro - $10/month
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-medium">✓ Pro Plan Active</p>
                    <p>You have access to 100,000 tokens per month</p>
                  </div>

                  <Button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Subscription"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </NoSSR>
  );
}

export default Profile;
