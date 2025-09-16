import { NextRequest } from 'next/server';
import { wordService } from '@/services/WordService';
import { createSuccessResponse, withErrorHandling, Errors } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Apply rate limiting
  const rateLimitCheck = applyRateLimit(request, 'search');
  if (!rateLimitCheck.allowed) {
    return rateLimitCheck.response!;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Validate required parameters
  if (!query || query.trim().length === 0) {
    throw Errors.VALIDATION_ERROR;
  }

  logger.info(`Search request: query=query.trim(), limit=undefined`);

  // Use the WordService for business logic
  const results = await wordService.searchWords(query.trim(), limit);

  // If no results found, return helpful message
  if (results.length === 0) {
    return createSuccessResponse({
      results: [],
      message: `Geen resultaten gevonden voor "${query}". Probeer een ander woord.`,
      suggestions: ['skeer', 'breezy', 'flexen']
    });
  }

  logger.info(`Search completed successfully: resultCount=results.length`);
  return createSuccessResponse(results, 200, { 
    source: results[0]?.match_type === 'fallback' ? 'fallback' : 'database' 
  });
});