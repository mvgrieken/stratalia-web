import { NextRequest } from 'next/server';
import { migrationService, migrations } from '@/lib/migrations';
import { createSuccessResponse, createErrorResponse, withErrorHandling, Errors, AppError } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';

export const POST = withErrorHandling(async (request: NextRequest) => {
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

  const { action } = await request.json();

  logger.info('Migration request', { action });

  try {
    switch (action) {
      case 'run': {
        await migrationService.runMigrations(migrations);
        return createSuccessResponse({
          message: 'Migrations executed successfully',
          executedCount: migrations.length
        });
      }

      case 'status': {
        const executedMigrations = await migrationService.getExecutedMigrations();
        const pendingMigrations = migrations.filter(m => !executedMigrations.includes(m.id));
        
        return createSuccessResponse({
          total: migrations.length,
          executed: executedMigrations.length,
          pending: pendingMigrations.length,
          executedMigrations,
          pendingMigrations: pendingMigrations.map(m => ({ id: m.id, name: m.name }))
        });
      }

      default:
        throw new AppError(
          Errors.VALIDATION_ERROR.code,
          'Invalid action. Use "run" or "status"',
          Errors.VALIDATION_ERROR.statusCode
        );
    }
  } catch (error) {
    logger.error('Migration operation failed', error);
    return createErrorResponse(error as Error);
  }
});
