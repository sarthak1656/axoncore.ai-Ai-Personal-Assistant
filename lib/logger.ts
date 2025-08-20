// Simple logger utility
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || "");
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || "");
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error || "");
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, data || "");
    }
  },
  // Performance monitoring
  performance: (operation: string, startTime: number) => {
    const duration = Date.now() - startTime;
    if (duration > 1000) {
      console.warn(`[PERFORMANCE] ${operation} took ${duration}ms (slow)`);
    } else if (duration > 500) {
      console.log(`[PERFORMANCE] ${operation} took ${duration}ms (moderate)`);
    } else {
      logger.debug(`[PERFORMANCE] ${operation} took ${duration}ms (fast)`);
    }
  },
};
