import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { secureStorage } from "./secureStorage";
import { logger } from "./logger";

// Hook to protect routes that require authentication
export function useAuthGuard(redirectTo: string = "/sign-in") {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const token = secureStorage.getToken();

    if (!token || !user) {
      logger.warn("Unauthorized access attempt, redirecting to sign-in");
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  return { user, isAuthenticated: !!user };
}

// Hook to redirect authenticated users away from auth pages
export function useAuthRedirect(redirectTo: string = "/workspace") {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const token = secureStorage.getToken();

    if (token && user) {
      logger.info(
        "Authenticated user accessing auth page, redirecting to workspace"
      );
      router.replace(redirectTo);
    }
  }, [user, router, redirectTo]);

  return { user, isAuthenticated: !!user };
}

// Hook to redirect authenticated users based on whether they have assistants
export function useSmartAuthRedirect() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const token = secureStorage.getToken();

    if (token && user) {
      // Check if user has assistants to determine where to redirect
      // This will be handled in the sign-in flow
      logger.info("Authenticated user detected, will check assistant status");
    }
  }, [user, router]);

  return { user, isAuthenticated: !!user };
}

// Utility to check if user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;

  const token = secureStorage.getToken();
  return !!token;
}

// Utility to get current user from storage
export function getCurrentUser() {
  return secureStorage.getUser();
}
