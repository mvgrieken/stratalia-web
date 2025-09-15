import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    logger.info(`🔍 [SEARCH-API] Request received - Query: "${query}", Limit: ${limit}`);

    if (!query) {
      logger.warn('❌ [SEARCH-API] Missing query parameter');
      return NextResponse.json({ 
        error: 'Query parameter is required',
        details: 'Please provide a search query'
      }, { status: 400 });
    }

    logger.info(`🔍 [SEARCH-API] Searching for: "${query}" with limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    logger.info(`🔍 [SEARCH-API] Environment check - URL: ${supabaseUrl ? 'SET' : 'MISSING'}, Key: ${supabaseAnonKey ? 'SET' : 'MISSING'}`);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('❌ [SEARCH-API] Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing',
        details: 'Environment variables not configured'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    logger.info(`🔍 [SEARCH-API] Supabase client created successfully`);

    // Simple search in words table
    logger.info(`🔍 [SEARCH-API] Executing search query: SELECT * FROM words WHERE word ILIKE '%${query}%' LIMIT ${limit}`);
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, definition, example')
      .ilike('word', `%${query}%`)
      .limit(limit);

    logger.info(`🔍 [SEARCH-API] Search query result - Data: ${words ? `${words.length} results` : 'NULL'}, Error: ${wordsError ? wordsError.code : 'NONE'}`);

    if (wordsError) {
      logger.error(`❌ [SEARCH-API] Database search error:`, {
        code: wordsError.code,
        message: wordsError.message,
        details: wordsError.details,
        hint: wordsError.hint
      });
      return NextResponse.json({
        error: 'Database search failed',
        details: wordsError.message,
        code: wordsError.code || 'UNKNOWN_ERROR'
      }, { status: 400 });
    }

    // Format results with defensive checks
    const results = words?.map(word => {
      // Defensive check for word data
      if (!word || !word.word) {
        logger.warn('Invalid word data found:', word);
        return null;
      }
      
      return {
        id: word.id,
        word: word.word,
        meaning: word.definition || '',
        example: word.example || '',
        match_type: word.word.toLowerCase() === query.toLowerCase() ? 'exact' : 'partial',
        similarity_score: word.word.toLowerCase() === query.toLowerCase() ? 1.0 : 0.8
      };
    }).filter(Boolean) || [];

    const duration = Date.now() - startTime;
    logger.performance('search-words', duration);
    logger.info(`✅ [SEARCH-API] Found ${results.length} results for "${query}" in ${duration}ms`);
    
    const response = NextResponse.json(results);
    
    // Cache search results for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.performance('search-error', duration);
    logger.error('❌ [SEARCH-API] Unexpected error in search API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      query: searchParams.get('query'),
      limit: searchParams.get('limit')
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}