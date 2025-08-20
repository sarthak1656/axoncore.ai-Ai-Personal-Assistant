import { useState, useCallback, useRef } from "react";

// Cache for API responses
const apiCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

// Database operation types
export interface DatabaseOperation<T = any> {
  execute: (...args: any[]) => Promise<T>;
  loading: boolean;
  error: string | null;
}

// Cache management functions
function getCachedResponse(key: string): any | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  apiCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: any, ttl: number = 300000) {
  apiCache.set(key, { data, timestamp: Date.now(), ttl });
}

function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (typeof key === "string" && key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
}

// Custom hook for database operations with caching
export function useDatabaseOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  cacheKey?: string,
  cacheTTL: number = 300000 // 5 minutes default
): DatabaseOperation<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Check cache first if cacheKey is provided
      if (cacheKey) {
        const cached = getCachedResponse(cacheKey);
        if (cached) {
          return cached;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result = await operation(...args);

        // Cache the result if cacheKey is provided
        if (cacheKey) {
          setCachedResponse(cacheKey, result, cacheTTL);
        }

        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, don't set error
          throw err;
        }

        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [operation, cacheKey, cacheTTL]
  );

  return { execute, loading, error };
}

// User operations hooks
export const useUserOperations = () => {
  const createUser = useDatabaseOperation(
    async (email: string, name: string, picture: string) => {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, picture }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const result = await response.json();
      clearCache("user");
      return result;
    }
  );

  const getUser = useDatabaseOperation(
    async (email: string) => {
      const response = await fetch(
        `/api/users/get?email=${encodeURIComponent(email)}`,
        {
          headers: {
            "Cache-Control": "max-age=300", // 5 minutes browser cache
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to get user");
      }

      return response.json();
    },
    (email: string) => `user:${email}`, // Cache key
    300000 // 5 minutes cache
  );

  const updateUserTokens = useDatabaseOperation(
    async (uid: string, tokensUsed: number) => {
      const response = await fetch("/api/users/update-tokens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, tokensUsed }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user tokens");
      }

      const result = await response.json();

      // Clear all user-related cache
      clearCache("user");

      return result;
    }
  );

  const cancelUserSubscription = useDatabaseOperation(async (uid: string) => {
    const response = await fetch("/api/users/cancel-subscription", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });

    if (!response.ok) {
      throw new Error("Failed to cancel subscription");
    }

    const result = await response.json();
    clearCache("user");
    return result;
  });

  return {
    createUser,
    getUser,
    updateUserTokens,
    cancelUserSubscription,
  };
};

// AI Assistant operations hooks
export const useAssistantOperations = () => {
  const insertSelectedAssistants = useDatabaseOperation(
    async (record: any[], uid: string) => {
      const response = await fetch("/api/assistants/insert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record, uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to insert assistants");
      }

      const result = await response.json();
      clearCache("assistants");
      return result;
    }
  );

  const getAllUserAssistants = useDatabaseOperation(
    async (uid: string) => {
      const response = await fetch(
        `/api/assistants/get-all?uid=${encodeURIComponent(uid)}`,
        {
          headers: {
            "Cache-Control": "max-age=60", // 1 minute browser cache
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get assistants");
      }

      return response.json();
    },
    (uid: string) => `assistants:${uid}`, // Cache key
    60000 // 1 minute cache
  );

  const updateUserAssistant = useDatabaseOperation(
    async (id: string, userInstruction: string, aiModelId: string) => {
      const response = await fetch("/api/assistants/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, userInstruction, aiModelId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update assistant");
      }

      const result = await response.json();
      clearCache("assistants");
      return result;
    }
  );

  const deleteUserAssistant = useDatabaseOperation(async (id: string) => {
    const response = await fetch("/api/assistants/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete assistant");
    }

    const result = await response.json();
    clearCache("assistants");
    return result;
  });

  return {
    insertSelectedAssistants,
    getAllUserAssistants,
    updateUserAssistant,
    deleteUserAssistant,
  };
};

// Message operations hook
export const useMessageOperations = () => {
  const saveMessage = useDatabaseOperation(
    async (params: {
      userId: string;
      assistantId: string;
      role: "user" | "assistant";
      content: string;
      tokensUsed?: number;
      modelUsed?: string;
    }) => {
      const response = await fetch("/api/messages/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      return response.json();
    }
  );

  const getMessagesByAssistant = useDatabaseOperation(
    async (params: { userId: string; assistantId: string; limit?: number }) => {
      const response = await fetch(
        `/api/messages/get-by-assistant?userId=${encodeURIComponent(
          params.userId
        )}&assistantId=${encodeURIComponent(params.assistantId)}&limit=${
          params.limit || 50
        }`,
        {
          headers: {
            "Cache-Control": "max-age=60", // 1 minute browser cache
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get messages");
      }

      return response.json();
    }
  );

  const getRecentMessages = useDatabaseOperation(
    async (params: { userId: string; limit?: number }) => {
      const response = await fetch(
        `/api/messages/get-recent?userId=${encodeURIComponent(
          params.userId
        )}&limit=${params.limit || 20}`,
        {
          headers: {
            "Cache-Control": "max-age=60", // 1 minute browser cache
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get recent messages");
      }

      return response.json();
    }
  );

  const deleteMessagesByAssistant = useDatabaseOperation(
    async (params: { userId: string; assistantId: string }) => {
      const response = await fetch("/api/messages/delete-by-assistant", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to delete messages");
      }

      return response.json();
    }
  );

  return {
    saveMessage,
    getMessagesByAssistant,
    getRecentMessages,
    deleteMessagesByAssistant,
  };
};
