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

  // Always return consistent response format
  const responseData = {
    results: results,
    message: results.length === 0 
      ? `Geen resultaten gevonden voor "${query}". Probeer een ander woord.`
      : `Gevonden ${results.length} resultaat${results.length !== 1 ? 'en' : ''} voor "${query}"`,
    suggestions: results.length === 0 
      ? ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit']
      : [],
    total: results.length,
    source: results.length > 0 && results[0]?.match_type === 'fallback' ? 'fallback' : 'database'
  };

  logger.info(`Search completed successfully: resultCount=${results.length}, source=${responseData.source}`);
  return createSuccessResponse(responseData, 200);
});