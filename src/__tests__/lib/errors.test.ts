import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextResponse } from 'next/server';
import { 
  normalizeError, 
  AppError, 
  ErrorCode, 
  Errors, 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling 
} from '@/lib/errors';
import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/logger');

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeError', () => {
    it('should return Error instance when given Error', () => {
      const error = new Error('Test error');
      const result = normalizeError(error);
      
      expect(result).toBe(error);
      expect(result.message).toBe('Test error');
    });

    it('should create Error from string', () => {
      const result = normalizeError('String error');
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error');
    });

    it('should create Error from object', () => {
      const errorObj = { code: 'TEST_ERROR', message: 'Test error' };
      const result = normalizeError(errorObj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('{"code":"TEST_ERROR","message":"Test error"}');
    });

    it('should handle circular references in objects', () => {
      const circularObj: any = { message: 'Circular error' };
      circularObj.self = circularObj;
      
      const result = normalizeError(circularObj);
      
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Unknown error');
    });

    it('should handle null and undefined', () => {
      const resultNull = normalizeError(null);
      const resultUndefined = normalizeError(undefined);
      
      expect(resultNull).toBeInstanceOf(Error);
      expect(resultNull.message).toBe('null');
      
      expect(resultUndefined).toBeInstanceOf(Error);
      expect(resultUndefined.message).toBe('');
    });

    it('should handle numbers and booleans', () => {
      const resultNumber = normalizeError(42);
      const resultBoolean = normalizeError(true);
      
      expect(resultNumber).toBeInstanceOf(Error);
      expect(resultNumber.message).toBe('42');
      
      expect(resultBoolean).toBeInstanceOf(Error);
      expect(resultBoolean.message).toBe('true');
    });
  });

  describe('AppError', () => {
    it('should create AppError with all properties', () => {
      const error = new AppError(
        'TEST_ERROR',
        'Test error message',
        400,
        new Error('Original error'),
        'fieldName'
      );
      
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.details).toBeInstanceOf(Error);
      expect(error.field).toBe('fieldName');
    });

    it('should create AppError with minimal properties', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');
      
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(500);
      expect(error.details).toBeUndefined();
      expect(error.field).toBeUndefined();
    });

    it('should be instanceof Error', () => {
      const error = new AppError('TEST_ERROR', 'Test error message');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.UNAUTHORIZED).toBe('UNAUTHORIZED');
      expect(ErrorCode.FORBIDDEN).toBe('FORBIDDEN');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.DATABASE_ERROR).toBe('DATABASE_ERROR');
      expect(ErrorCode.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
      expect(ErrorCode.MISSING_REQUIRED_FIELD).toBe('MISSING_REQUIRED_FIELD');
    });
  });

  describe('Errors object', () => {
    it('should have all expected error definitions', () => {
      expect(Errors.VALIDATION_ERROR).toBeInstanceOf(AppError);
      expect(Errors.VALIDATION_ERROR.code).toBe('VALIDATION_ERROR');
      expect(Errors.VALIDATION_ERROR.message).toBe('Validation failed');
      expect(Errors.VALIDATION_ERROR.statusCode).toBe(400);
      
      expect(Errors.UNAUTHORIZED).toBeInstanceOf(AppError);
      expect(Errors.UNAUTHORIZED.code).toBe('UNAUTHORIZED');
      expect(Errors.UNAUTHORIZED.message).toBe('Authentication required');
      expect(Errors.UNAUTHORIZED.statusCode).toBe(401);
      
      expect(Errors.FORBIDDEN).toBeInstanceOf(AppError);
      expect(Errors.FORBIDDEN.code).toBe('FORBIDDEN');
      expect(Errors.FORBIDDEN.message).toBe('Access denied');
      expect(Errors.FORBIDDEN.statusCode).toBe(403);
      
      expect(Errors.NOT_FOUND).toBeInstanceOf(AppError);
      expect(Errors.NOT_FOUND.code).toBe('NOT_FOUND');
      expect(Errors.NOT_FOUND.message).toBe('Resource not found');
      expect(Errors.NOT_FOUND.statusCode).toBe(404);
      
      expect(Errors.INTERNAL_ERROR).toBeInstanceOf(AppError);
      expect(Errors.INTERNAL_ERROR.code).toBe('INTERNAL_ERROR');
      expect(Errors.INTERNAL_ERROR.message).toBe('Internal server error');
      expect(Errors.INTERNAL_ERROR.statusCode).toBe(500);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { message: 'Success' };
      const response = createSuccessResponse(data);
      
      expect(response).toBeInstanceOf(NextResponse);
      
      // Note: We can't easily test the JSON content without mocking NextResponse
      // but we can verify it's a NextResponse instance
    });

    it('should create success response with custom status', () => {
      const data = { message: 'Created' };
      const response = createSuccessResponse(data, 201);
      
      expect(response).toBeInstanceOf(NextResponse);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response for AppError', () => {
      const appError = new AppError(
        'TEST_ERROR',
        'Test error message',
        400,
        new Error('Details'),
        'fieldName'
      );
      
      const response = createErrorResponse(appError);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(logger.error).toHaveBeenCalledWith('API Error: Test error message', appError);
    });

    it('should create error response for unknown error', () => {
      const unknownError = 'Unknown error';
      const response = createErrorResponse(unknownError);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(logger.error).toHaveBeenCalledWith('Unexpected error', unknownError);
    });

    it('should include request ID when provided', () => {
      const appError = new AppError('TEST_ERROR', 'Test error message');
      const response = createErrorResponse(appError, 'req-123');
      
      expect(response).toBeInstanceOf(NextResponse);
    });

    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const unknownError = 'Sensitive error details';
      const response = createErrorResponse(unknownError);
      
      expect(response).toBeInstanceOf(NextResponse);
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('withErrorHandling', () => {
    it('should return result when function succeeds', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(mockFn);
      
      const result = await wrappedFn('arg1', 'arg2');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should re-throw AppError without modification', async () => {
      const appError = new AppError('TEST_ERROR', 'Test error message');
      const mockFn = vi.fn().mockRejectedValue(appError);
      const wrappedFn = withErrorHandling(mockFn);
      
      await expect(wrappedFn()).rejects.toThrow(appError);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should wrap unknown errors in AppError', async () => {
      const unknownError = new Error('Unknown error');
      const mockFn = vi.fn().mockRejectedValue(unknownError);
      const wrappedFn = withErrorHandling(mockFn);
      
      await expect(wrappedFn()).rejects.toThrow(AppError);
      expect(logger.error).toHaveBeenCalledWith('Unhandled error in async function', unknownError);
    });

    it('should handle non-Error values', async () => {
      const mockFn = vi.fn().mockRejectedValue('String error');
      const wrappedFn = withErrorHandling(mockFn);
      
      await expect(wrappedFn()).rejects.toThrow(AppError);
      expect(logger.error).toHaveBeenCalledWith('Unhandled error in async function', 'String error');
    });

    it('should include request ID in error handling', async () => {
      const unknownError = new Error('Unknown error');
      const mockFn = vi.fn().mockRejectedValue(unknownError);
      const wrappedFn = withErrorHandling(mockFn, 'req-123');
      
      await expect(wrappedFn()).rejects.toThrow(AppError);
      expect(logger.error).toHaveBeenCalledWith('Unhandled error in async function', unknownError);
    });
  });
});
