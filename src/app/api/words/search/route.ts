import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    logger.info(`Searching for: "${query}" with limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Simple search in words table
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, definition, example')
      .ilike('word', `%${query}%`)
      .limit(limit);

    if (wordsError) {
      logger.dbError('words', 'SELECT', wordsError);
      return NextResponse.json({
        error: 'Database search failed',
        details: wordsError.message,
        code: wordsError.code || 'UNKNOWN_ERROR'
      }, { status: 500 });
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
    logger.info(`Found ${results.length} results for "${query}"`);
    
    const response = NextResponse.json(results);
    
    // Cache search results for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.performance('search-error', duration);
    logger.error('Error in search API', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}