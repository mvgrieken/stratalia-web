/**
 * Standardized error handling and response structures
 */

import { NextResponse } from 'next/server';
import { logger } from './logger';

export enum ErrorCode {
  // Only include errors that are actually used
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId?: string;
    source?: 'database' | 'fallback' | 'cache';
  };
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: string;
  public readonly field?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: string,
    field?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.field = field;
  }
}

// Predefined error instances
export const Errors = {
  UNAUTHORIZED: new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401),
  FORBIDDEN: new AppError(ErrorCode.FORBIDDEN, 'Access denied', 403),
  NOT_FOUND: new AppError(ErrorCode.NOT_FOUND, 'Resource not found', 404),
  VALIDATION_ERROR: new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', 400),
  INTERNAL_ERROR: new AppError(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500),
  DATABASE_ERROR: new AppError(ErrorCode.DATABASE_ERROR, 'Database operation failed', 500),
  CONFIGURATION_ERROR: new AppError(ErrorCode.CONFIGURATION_ERROR, 'Configuration error', 500),
};

/**
 * Create standardized API error response
 */
export function createErrorResponse(
  error: AppError | Error,
  requestId?: string
): NextResponse<ApiResponse> {
  const timestamp = new Date().toISOString();
  
  if (error instanceof AppError) {
    logger.error(`API Error: ${error.message}`, error, {
      code: error.code,
      statusCode: error.statusCode,
      field: error.field,
      requestId,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          field: error.field,
          timestamp,
          requestId,
        },
        meta: {
          timestamp,
          requestId,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle unexpected errors
  logger.error('Unexpected error', error, { requestId });
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp,
        requestId,
      },
      meta: {
        timestamp,
        requestId,
      },
    },
    { status: 500 }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: Partial<ApiResponse['meta']>
): NextResponse<ApiResponse<T>> {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp,
        ...meta,
      },
    },
    { status: statusCode }
  );
}

/**
 * Validation helper
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missing = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  );
  
  if (missing.length > 0) {
    throw new AppError(
      ErrorCode.MISSING_REQUIRED_FIELD,
      `Missing required fields: ${missing.join(', ')}`,
      400,
      undefined,
      missing[0] as string
    );
  }
}

/**
 * Async error handler wrapper
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  requestId?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Unhandled error in async function', error as Error, { requestId });
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'An unexpected error occurred',
        500,
        process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      );
    }
  };
}
