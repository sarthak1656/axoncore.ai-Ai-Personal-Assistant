"use client";
import { Button } from "@/components/ui/button";
import { GetAuthUserData } from "@/services/GlobalApi";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";
import { useUserOperations } from "@/lib/useDatabase";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function SignIn() {
  // Check if user is already authenticated and redirect appropriately
  const authContext = useContext(AuthContext);
  const { user } = authContext || {};
  const { getUser } = useUserOperations();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const checkExistingUser = async () => {
      const token = secureStorage.getToken();
      if (token && user) {
        // All authenticated users go to workspace
        logger.info("Authenticated user, redirecting to workspace");
        router.replace("/workspace");
      }
    };

    checkExistingUser();
  }, [user, router]);
  const { createUser } = useUserOperations();
  const { setUser } = authContext || {};

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsSigningIn(true);

        // Store token securely
        secureStorage.setToken(tokenResponse.access_token);
        logger.info("Access token stored securely");

        const userInfo = await GetAuthUserData(tokenResponse.access_token);

        // Check if user already exists
        try {
          const existingUser = await getUser.execute(userInfo?.email);

          if (existingUser) {
            // User exists - redirect to workspace
            setUser?.(existingUser);
            logger.info(
              "Returning user authenticated, redirecting to workspace"
            );
            toast.success("Welcome back! Redirecting to workspace...");
            router.push("/workspace");
            return;
          }
        } catch (error) {
          // User doesn't exist, continue with creation
          logger.info("New user, creating account");
        }

        // Create new user
        const result = await createUser.execute(
          userInfo?.email,
          userInfo?.name,
          userInfo?.picture
        );

        setUser?.(result);
        logger.info("New user created and authenticated successfully");
        toast.success(
          "Account created successfully! Redirecting to workspace..."
        );
        router.push("/workspace");
      } catch (error) {
        logger.error("Error during sign-in process", error);
        secureStorage.clearUser(); // Clear any stored data on error
        toast.error("Sign-in failed. Please try again.");
      } finally {
        setIsSigningIn(false);
      }
    },
    onError: (errorResponse) => {
      logger.error("Google login error", errorResponse);
      toast.error("Google sign-in failed. Please try again.");
      setIsSigningIn(false);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-10 shadow-xl">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex justify-center">
            <Image src="/logo.svg" alt="logo" width={48} height={48} priority />
          </div>
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-medium text-gray-900 tracking-tight leading-tight">
              Sign in to your account
            </h1>
            <p className="text-base text-gray-600 font-medium leading-6">
              Welcome back! Please sign in to continue.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 text-base font-medium tracking-wide"
            onClick={() => googleLogin()}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
