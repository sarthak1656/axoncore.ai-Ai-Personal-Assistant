"use client";
import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthContext } from "@/context/AuthContext";
import { User } from "@/types";
import { secureStorage } from "@/lib/secureStorage";
import { logger } from "@/lib/logger";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load user from secure storage on mount (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      const savedUser = secureStorage.getUser();
      if (savedUser) {
        try {
          setUser(savedUser);
          logger.info("User loaded from secure storage");
        } catch (error) {
          logger.error("Error loading user from secure storage", error);
        }
      }
    }
  }, [isHydrated]);

  // Save user to secure storage when it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && user) {
      secureStorage.setUser(user);
      logger.info("User saved to secure storage");
    }
  }, [user, isHydrated]);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <AuthContext.Provider value={{ user, setUser }}>
        <div suppressHydrationWarning>{children}</div>
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
}

export default Provider;
