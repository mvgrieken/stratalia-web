/**
 * Base Service Class
 * Provides centralized error handling, logging, and common functionality
 */

import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { AppError, Errors } from '@/lib/errors';

export interface ServiceConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export abstract class BaseService {
  protected config: ServiceConfig;
  protected serviceName: string;

  constructor(serviceName: string, config: ServiceConfig = {}) {
    this.serviceName = serviceName;
    this.config = {
      timeout: 30000, // 30 seconds
      retries: 3,
      retryDelay: 1000, // 1 second
      ...config,
    };
  }

  /**
   * Centralized error handling wrapper
   */
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      logger.info(`${this.serviceName}: Starting ${operationName} - ${JSON.stringify(context)}`);
      
      const result = await this.withRetry(operation, operationName);
      
      const duration = Date.now() - startTime;
      logger.info(`${this.serviceName}: ${operationName} completed - ${JSON.stringify({...context, duration: `${duration}ms`})}`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const normalizedError = normalizeError(error);
      
      logger.error(`${this.serviceName}: ${operationName} failed - ${JSON.stringify({...context, duration: `${duration}ms`})}`, normalizedError);
      
      // Convert to AppError if not already
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        Errors.INTERNAL_ERROR.code,
        `${operationName} failed: ${normalizedError.message}`,
        Errors.INTERNAL_ERROR.statusCode
      );
    }
  }

  /**
   * Retry mechanism with exponential backoff
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        return await this.withTimeout(operation);
      } catch (error) {
        lastError = normalizeError(error);
        
        if (attempt === this.config.retries) {
          logger.warn(`${this.serviceName}: ${operationName} failed after ${attempt} attempts`);
          throw lastError;
        }
        
        const delay = this.config.retryDelay! * Math.pow(2, attempt - 1);
        logger.warn(`${this.serviceName}: ${operationName} attempt ${attempt} failed, retrying in ${delay}ms`);
        
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  /**
   * Timeout wrapper
   */
  private async withTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${this.config.timeout}ms`));
        }, this.config.timeout);
      }),
    ]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create standardized service response
   */
  protected createResponse<T>(
    data: T,
    success: boolean = true,
    error?: string
  ): ServiceResponse<T> {
    return {
      data,
      success,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(params: Record<string, any>, required: string[]): void {
    const missing = required.filter(key => !params[key]);
    
    if (missing.length > 0) {
      throw new AppError(
        Errors.VALIDATION_ERROR.code,
        `Missing required parameters: ${missing.join(', ')}`,
        Errors.VALIDATION_ERROR.statusCode
      );
    }
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (input && typeof input === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }

  /**
   * Get service health status
   */
  public async getHealthStatus(): Promise<{ healthy: boolean; service: string; timestamp: string }> {
    try {
      // Override in subclasses for specific health checks
      await this.healthCheck();
      
      return {
        healthy: true,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        healthy: false,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Override in subclasses for specific health checks
   */
  protected async healthCheck(): Promise<void> {
    // Default implementation - can be overridden
  }
}

export default BaseService;
