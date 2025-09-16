/**
 * Centralized logging service
 * Replaces console.log statements with structured logging
 */

export const logger = {
  error: (message: string, error?: Error) => {
    if (error) {
      console.error(`[ERROR] ${message}:`, error.message, error.stack);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  info: (message: string) => console.info(`[INFO] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
  debug: (message: string) => console.debug(`[DEBUG] ${message}`),
};