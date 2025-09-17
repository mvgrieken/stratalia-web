import { NextRequest } from 'next/server';
import { wordService } from '@/services/WordService';
import { createSuccessResponse } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
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
      return createSuccessResponse({
        results: [],
        message: 'Voer een zoekterm in',
        suggestions: ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit'],
        total: 0,
        source: 'fallback'
      }, 200);
    }

    logger.info(`Search request: query=${query.trim()}, limit=${limit}`);

    // Use the WordService for business logic with fallback
    let results;
    try {
      results = await wordService.searchWords(query.trim(), limit);
    } catch (serviceError) {
      logger.warn(`WordService failed, using direct fallback: ${serviceError}`);
      // Direct fallback to mock data if service fails
      const { mockDataService } = await import('@/lib/mock-data');
      const mockWords = mockDataService.searchWords(query.trim().toLowerCase(), limit);
      results = mockWords.map(word => ({
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        example: word.example,
        match_type: word.word.toLowerCase() === query.trim().toLowerCase() ? 'exact' as const : 'partial' as const,
        similarity_score: word.word.toLowerCase() === query.trim().toLowerCase() ? 1.0 : 0.8
      }));
    }

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

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Search API error:', error instanceof Error ? error : new Error(errorMessage));
    
    // Return fallback response instead of error
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    
    return createSuccessResponse({
      results: [],
      message: `Zoeken mislukt voor "${query}". Probeer het opnieuw.`,
      suggestions: ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit'],
      total: 0,
      source: 'fallback'
    }, 200);
  }
}