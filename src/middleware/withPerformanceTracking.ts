/**
 * Performance Tracking Wrapper
 * Higher-order function for wrapping API routes with performance tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMiddleware } from './PerformanceMiddleware';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

export interface PerformanceTrackingOptions {
  trackMemory?: boolean;
  trackResponseSize?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Wrap an API route handler with performance tracking
 */
export function withPerformanceTracking(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: PerformanceTrackingOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const {
      trackMemory = true,
      trackResponseSize = true,
      logLevel = 'info',
    } = options;

    const requestId = performanceMiddleware.startTracking(request);
    let response: NextResponse;

    try {
      // Execute the handler
      response = await handler(request, context);

      // End tracking with success
      performanceMiddleware.endTracking(requestId, response);

      return response;
    } catch (error) {
      // Create error response
      const normalizedError = normalizeError(error);
      response = new NextResponse(
        JSON.stringify({
          error: 'Internal server error',
          message: normalizedError.message,
          requestId,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
        }
      );

      // End tracking with error
      performanceMiddleware.endTracking(requestId, response, normalizedError);

      // Log error
      logger.error(`API route error: ${request.method} ${request.url} - requestId=${requestId}, method=${request.method}, url=${request.url}`, normalizedError);

      return response;
    }
  };
}

/**
 * Decorator for class methods
 */
export function TrackPerformance(options: PerformanceTrackingOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const methodName = `${className}.${propertyName}`;

      try {
        logger.debug(`Starting method: ${methodName}`);
        
        const result = await method.apply(this, args);
        
        const duration = Date.now() - startTime;
        logger.debug(`Method completed: ${methodName} - duration=${duration}ms`);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        const normalizedError = normalizeError(error);
        
        logger.error(`Method failed: ${methodName} - duration=${duration}ms`, normalizedError);

        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Track performance of a specific operation
 */
export async function trackPerformance<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: PerformanceTrackingOptions = {}
): Promise<T> {
  const startTime = Date.now();
  const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger.debug(`Starting operation: ${operationName} - operationId=${operationId}`);
    
    const result = await operation();
    
    const duration = Date.now() - startTime;
    logger.debug(`Operation completed: ${operationName} - operationId=${operationId}, duration=${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const normalizedError = normalizeError(error);
    
    logger.error(`Operation failed: ${operationName} - operationId=${operationId}, duration=${duration}ms`, normalizedError);

    throw error;
  }
}

export default withPerformanceTracking;
