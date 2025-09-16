/**
 * Centralized logging service
 * Replaces console.log statements with structured logging
 */

// LogLevel enum removed as it's not used

interface LogEntry {
  level: number;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private level: number;
  private isDevelopment: boolean;

  constructor() {
    this.level = process.env.NODE_ENV === 'development' ? 0 : 1;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private log(level: number, message: string, context?: Record<string, any>, error?: Error) {
    if (level < this.level) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // In development, use console with colors
    if (this.isDevelopment) {
      const colors = {
        [LogLevel.DEBUG]: '\x1b[36m', // Cyan
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.ERROR]: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
      
      console.log(
        `${colors[level]}${levelNames[level]}${reset} [${entry.timestamp}] ${message}`,
        context ? context : '',
        error ? error : ''
      );
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(0, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(1, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(2, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(3, message, context, error);
  }
}

export const logger = new Logger();