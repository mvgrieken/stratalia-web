import { NextRequest } from 'next/server';
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
        suggestions: ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick'],
        total: 0,
        source: 'fallback'
      }, 200);
    }

    logger.info(`Search request: query=${query.trim()}, limit=${limit}`);

    // Always use mock data for now to ensure reliability
    let results: Array<{
      id: string;
      word: string;
      meaning: string;
      example: string;
      match_type: 'exact' | 'partial';
      similarity_score: number;
    }>;
    try {
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
      
      logger.info(`Search using mock data: found ${results.length} results`);
    } catch (fallbackError) {
      logger.error('Even mock data failed:', fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)));
      results = [];
    }

    // Always return consistent response format
    const responseData = {
      results: results,
      message: results.length === 0 
        ? `Geen resultaten gevonden voor "${query}". Probeer een ander woord.`
        : `Gevonden ${results.length} resultaat${results.length !== 1 ? 'en' : ''} voor "${query}"`,
      suggestions: results.length === 0 
        ? ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick']
        : [],
      total: results.length,
      source: 'fallback'
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
      suggestions: ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick'],
      total: 0,
      source: 'fallback'
    }, 200);
  }
}