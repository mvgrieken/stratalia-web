import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';
import { cacheService, cacheKeys, CACHE_TTL } from '@/lib/cache-service';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/config';
import type { SearchResult } from '@/types/api';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().trim().min(1).optional(),
  limit: z.string().optional()
});

export const GET = withApiError(withZod(searchSchema, async (request: NextRequest) => {
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

    // Check cache first - normalize query for consistent cache keys
    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = cacheKeys.search(normalizedQuery, limit);
    const cachedResults = cacheService.get<SearchResult[]>(cacheKey);

    if (cachedResults) {
      logger.info(`Search cache hit: query=${query.trim()}, results=${cachedResults.length}`);
      const responseData = {
        results: cachedResults,
        message: cachedResults.length === 0 
          ? `Geen resultaten gevonden voor "${query}". Probeer een ander woord.`
          : `Gevonden ${cachedResults.length} resultaat${cachedResults.length !== 1 ? 'en' : ''} voor "${query}"`,
        suggestions: cachedResults.length === 0 
          ? ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick']
          : [],
        total: cachedResults.length,
        source: 'cache'
      };
      return createSuccessResponse(responseData, 200);
    }

    // Try Supabase first, fallback to mock data
    let results: SearchResult[];
    let source = 'database';
    
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServiceClient();
        
        // Full-text search (fts) across key columns with fallback to ilike
        const { data: ftsWords, error: ftsError } = await supabase
          .from('words')
          .select('id, word, definition, example, category, difficulty')
          .or(`word.fts.${normalizedQuery},definition.fts.${normalizedQuery},example.fts.${normalizedQuery}`)
          .eq('is_active', true)
          .order('usage_frequency', { ascending: false })
          .limit(limit);

        let words = ftsWords;
        if ((ftsError || !ftsWords || ftsWords.length === 0)) {
          const { data: ilikeWords, error: ilikeError } = await supabase
            .from('words')
            .select('id, word, definition, example, category, difficulty')
            .or(`word.ilike.%${normalizedQuery}%,definition.ilike.%${normalizedQuery}%,example.ilike.%${normalizedQuery}%`)
            .eq('is_active', true)
            .order('usage_frequency', { ascending: false })
            .limit(limit);
          if (ilikeError) {
            logger.warn(`Supabase ilike search failed: ${ilikeError instanceof Error ? ilikeError.message : String(ilikeError)}`);
          }
          words = ilikeWords || [];
        }

        if (ftsError && (!words || words.length === 0)) {
          logger.warn(`Supabase search failed, using fallback: ${ftsError instanceof Error ? ftsError.message : String(ftsError)}`);
          throw new Error('Database search failed');
        }

        if (words && words.length > 0) {
          // Update search statistics
          await supabase
            .from('words')
            .update({ 
              usage_frequency: 1, // Increment would need a database function
              updated_at: new Date().toISOString()
            })
            .in('id', words.map(w => w.id));

          results = words.map(word => ({
            id: word.id,
            word: word.word,
            meaning: word.definition || '',
            example: word.example || '',
            match_type: word.word.toLowerCase() === normalizedQuery ? 'exact' as const : 'partial' as const,
            similarity_score: word.word.toLowerCase() === normalizedQuery ? 1.0 : 
                            word.word.toLowerCase().includes(normalizedQuery) ? 0.9 : 0.7
          }));
          
          logger.info(`Supabase search: found ${results.length} results`);
        } else {
          // No results in database, try fuzzy search
          const { data: fuzzyWords } = await supabase
            .rpc('search_words_fuzzy', { 
              search_term: normalizedQuery,
              similarity_threshold: 0.3,
              max_results: limit 
            });

          if (fuzzyWords && fuzzyWords.length > 0) {
            results = fuzzyWords.map((word: any) => ({
              id: word.id,
              word: word.word,
              meaning: word.meaning,
              example: word.example || '',
              match_type: 'fuzzy' as const,
              similarity_score: word.similarity || 0.5
            }));
            source = 'fuzzy';
          } else {
            throw new Error('No database results');
          }
        }
        
        // Cache the results
        cacheService.set(cacheKey, results, CACHE_TTL.MEDIUM);
        
        } catch (dbError) {
          logger.warn(`Database search failed, falling back to mock data: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
          source = 'fallback';
          
          // Fallback to mock data
          const { searchWords } = await import('@/lib/mock-data');
          const mockWords = searchWords(normalizedQuery, limit);
          results = mockWords.map(word => ({
            id: word.id,
            word: word.word,
            meaning: word.meaning,
            example: word.example,
            match_type: word.word.toLowerCase() === normalizedQuery ? 'exact' as const : 'partial' as const,
            similarity_score: word.word.toLowerCase() === normalizedQuery ? 1.0 : 0.8
          }));
        }
    } else {
      // No Supabase config, use mock data
      source = 'fallback';
      const { searchWords } = await import('@/lib/mock-data');
      const mockWords = searchWords(normalizedQuery, limit);
      results = mockWords.map(word => ({
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        example: word.example,
        match_type: word.word.toLowerCase() === normalizedQuery ? 'exact' as const : 'partial' as const,
        similarity_score: word.word.toLowerCase() === normalizedQuery ? 1.0 : 0.8
      }));
      
      logger.info(`Mock data search: found ${results.length} results`);
    }
    
    // Cache the results
    cacheService.set(cacheKey, results, CACHE_TTL.MEDIUM);

    // Generate intelligent suggestions when no results found
    let suggestions: string[] = [];
    if (results.length === 0) {
      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServiceClient();
          const { data: suggestedWords } = await supabase
            .from('words')
            .select('word')
            .eq('is_active', true)
            .order('popularity_score', { ascending: false })
            .limit(10);
          
          suggestions = suggestedWords?.map(w => w.word) || 
                       ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick'];
        } catch (suggestionError) {
          suggestions = ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick'];
        }
      } else {
        suggestions = ['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit', 'waggi', 'bro', 'sick'];
      }
    }

    // Always return consistent response format
    const responseData = {
      results: results,
      message: results.length === 0 
        ? `Geen resultaten gevonden voor "${query}". Probeer een van de suggesties hieronder.`
        : `Gevonden ${results.length} resultaat${results.length !== 1 ? 'en' : ''} voor "${query}"`,
      suggestions: suggestions,
      total: results.length,
      source: source,
      query_info: {
        original: query,
        normalized: normalizedQuery,
        search_type: source === 'fuzzy' ? 'fuzzy_match' : 
                    results.some(r => r.match_type === 'exact') ? 'exact_match' : 'partial_match'
      }
    };

    logger.info(`Search completed successfully: resultCount=${results.length}, source=${responseData.source}`);
    return createSuccessResponse(responseData, 200);
}));