/**
 * Production-safe logging utility
 * Automatically disables console.log in production builds
 */

const isProduction = process.env.NODE_ENV === 'production';

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevelType = LogLevel[keyof LogLevel];

class Logger {
  private shouldLog(level: LogLevelType): boolean {
    if (isProduction) {
      // In production, only log errors and warnings
      return level === 'error' || level === 'warn';
    }
    // In development, log everything
    return true;
  }

  private formatMessage(level: LogLevelType, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [STRATALIA]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  error(message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // API-specific logging methods
  apiRequest(method: string, endpoint: string, data?: any): void {
    this.info(`API ${method} ${endpoint}`, data);
  }

  apiResponse(endpoint: string, status: number, duration?: number): void {
    const message = `API Response ${endpoint} - ${status}`;
    const data = duration ? { duration: `${duration}ms` } : undefined;
    
    if (status >= 400) {
      this.error(message, data);
    } else if (status >= 300) {
      this.warn(message, data);
    } else {
      this.info(message, data);
    }
  }

  // Database-specific logging methods
  dbQuery(table: string, operation: string, duration?: number): void {
    const message = `DB ${operation} on ${table}`;
    const data = duration ? { duration: `${duration}ms` } : undefined;
    this.debug(message, data);
  }

  dbError(table: string, operation: string, error: any): void {
    this.error(`DB ${operation} failed on ${table}`, { error: error.message || error });
  }

  // Security logging
  security(event: string, data?: any): void {
    this.warn(`SECURITY: ${event}`, data);
  }

  // Performance logging
  performance(operation: string, duration: number, data?: any): void {
    const message = `PERF: ${operation} took ${duration}ms`;
    if (duration > 1000) {
      this.warn(message, data);
    } else {
      this.debug(message, data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for TypeScript
export type { LogLevelType };
export { LOG_LEVELS };
