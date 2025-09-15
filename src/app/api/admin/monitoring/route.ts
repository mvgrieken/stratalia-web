import { NextRequest } from 'next/server';
import { monitoringService } from '@/lib/monitoring';
import { createSuccessResponse, createErrorResponse, withErrorHandling, Errors } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Apply strict rate limiting for admin operations
  const rateLimitCheck = applyRateLimit(request, 'auth');
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  // Check if user is admin (in production, implement proper auth)
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      Errors.UNAUTHORIZED.code,
      'Admin authorization required',
      Errors.UNAUTHORIZED.statusCode
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'stats';
  const since = searchParams.get('since');
  const name = searchParams.get('name');
  const userId = searchParams.get('userId');
  const action = searchParams.get('action');

  logger.info('Monitoring data request', { type, since, name, userId, action });

  try {
    const sinceDate = since ? new Date(since) : undefined;

    switch (type) {
      case 'stats': {
        const stats = monitoringService.getStats();
        return createSuccessResponse(stats);
      }

      case 'metrics': {
        const metrics = monitoringService.getMetrics({ 
          name: name || undefined, 
          since: sinceDate 
        });
        return createSuccessResponse({ metrics, count: metrics.length });
      }

      case 'errors': {
        const errors = monitoringService.getErrors({ 
          since: sinceDate, 
          userId: userId || undefined 
        });
        return createSuccessResponse({ errors, count: errors.length });
      }

      case 'userActions': {
        const userActions = monitoringService.getUserActions({ 
          action: action || undefined, 
          userId: userId || undefined, 
          since: sinceDate 
        });
        return createSuccessResponse({ userActions, count: userActions.length });
      }

      default:
        throw new AppError(
          Errors.VALIDATION_ERROR.code,
          'Invalid type. Use "stats", "metrics", "errors", or "userActions"',
          Errors.VALIDATION_ERROR.statusCode
        );
    }
  } catch (error) {
    logger.error('Monitoring data request failed', error);
    return createErrorResponse(error as Error);
  }
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  // Apply strict rate limiting for admin operations
  const rateLimitCheck = applyRateLimit(request, 'auth');
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  // Check if user is admin
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      Errors.UNAUTHORIZED.code,
      'Admin authorization required',
      Errors.UNAUTHORIZED.statusCode
    );
  }

  const { searchParams } = new URL(request.url);
  const olderThanHours = parseInt(searchParams.get('olderThanHours') || '24');

  logger.info('Clearing old monitoring data', { olderThanHours });

  try {
    monitoringService.clearOldData(olderThanHours);
    
    return createSuccessResponse({
      message: 'Old monitoring data cleared successfully',
      olderThanHours
    });
  } catch (error) {
    logger.error('Failed to clear monitoring data', error);
    return createErrorResponse(error as Error);
  }
});
