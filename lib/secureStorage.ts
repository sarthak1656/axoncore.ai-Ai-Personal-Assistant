// Secure storage utility to replace localStorage
export class SecureStorage {
  private static readonly PREFIX = "ai_agent_";
  private static readonly ENCRYPTION_KEY = "your-secret-key"; // In production, use environment variable

  // Store data securely
  static setItem(key: string, value: any): void {
    try {
      if (typeof window === "undefined") return;

      const fullKey = this.PREFIX + key;
      const serializedValue = JSON.stringify(value);

      // In production, you should encrypt this data
      // For now, we'll use base64 encoding as a basic obfuscation
      const encodedValue = btoa(serializedValue);

      sessionStorage.setItem(fullKey, encodedValue);
    } catch (error) {
      console.error("Error storing data securely:", error);
    }
  }

  // Retrieve data securely
  static getItem<T = any>(key: string): T | null {
    try {
      if (typeof window === "undefined") return null;

      const fullKey = this.PREFIX + key;
      const encodedValue = sessionStorage.getItem(fullKey);

      if (!encodedValue) return null;

      // Decode the value
      const serializedValue = atob(encodedValue);
      return JSON.parse(serializedValue);
    } catch (error) {
      console.error("Error retrieving data securely:", error);
      return null;
    }
  }

  // Remove data
  static removeItem(key: string): void {
    try {
      if (typeof window === "undefined") return;

      const fullKey = this.PREFIX + key;
      sessionStorage.removeItem(fullKey);
    } catch (error) {
      console.error("Error removing data securely:", error);
    }
  }

  // Clear all app data
  static clear(): void {
    try {
      if (typeof window === "undefined") return;

      const keys = Object.keys(sessionStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing secure storage:", error);
    }
  }

  // Check if storage is available
  static isAvailable(): boolean {
    try {
      if (typeof window === "undefined") return false;

      const testKey = "__test__";
      sessionStorage.setItem(testKey, "test");
      sessionStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// Convenience functions
export const secureStorage = {
  setUser: (user: any) => SecureStorage.setItem("user", user),
  getUser: () => SecureStorage.getItem("user"),
  setToken: (token: string) => SecureStorage.setItem("access_token", token),
  getToken: () => SecureStorage.getItem<string>("access_token"),
  clearUser: () => {
    SecureStorage.removeItem("user");
    SecureStorage.removeItem("access_token");
  },
  clearAll: () => SecureStorage.clear(),
};
