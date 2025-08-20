"use client";
import React, { useEffect, useState } from "react";
import Header from "./_components/Header";
import { GetAuthUserData } from "@/services/GlobalApi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AssistanceContext } from "@/context/AssistantContext";
import { ASSISTANT } from "@/types/assistant";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";
import { useUserOperations } from "@/lib/useDatabase";
import NoSSR from "@/components/NoSSR";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { getUser } = useUserOperations();
  const { user, setUser } = useAuth();
  const [assistants, setAssistants] = useState<ASSISTANT | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    // Ensure we're on the client side
    if (typeof window !== "undefined") {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && !user) {
      CheckUserAuth();
    }
  }, [isHydrated, user]); // Add user dependency back but with proper hydration check

  const CheckUserAuth = async () => {
    // Don't check if user is already set or if not hydrated
    if (user || !isHydrated) return;

    const token = secureStorage.getToken();

    //check if user is authenticated
    const userInfo = token && (await GetAuthUserData(token));
    if (!userInfo?.email) {
      logger.warn("No valid user found, redirecting to sign-in");
      router.replace("/sign-in");
      return;
    }

    //check if user is verified
    try {
      const result = await getUser.execute(userInfo?.email);
      setUser(result);
      logger.info("User authenticated successfully");

      // Don't automatically redirect - let the user navigate freely
    } catch (error) {
      logger.error("Error verifying user", error);
      secureStorage.clearUser();
      router.replace("/sign-in");
    }
  };

  // Show loading until hydration is complete
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NoSSR
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <div>
        <AssistanceContext.Provider value={{ assistants, setAssistants }}>
          <Header />
          {children}
        </AssistanceContext.Provider>
      </div>
    </NoSSR>
  );
}

export default Provider;
