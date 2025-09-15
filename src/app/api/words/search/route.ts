import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🔍 [SEARCH-API] Request received - Query: "${query}", Limit: ${limit}`);

    if (!query) {
      console.warn('❌ [SEARCH-API] Missing query parameter');
      return NextResponse.json({ 
        error: 'Query parameter is required',
        details: 'Please provide a search query'
      }, { status: 400 });
    }

    console.log(`🔍 [SEARCH-API] Searching for: "${query}" with limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log(`🔍 [SEARCH-API] Environment check - URL: ${supabaseUrl ? 'SET' : 'MISSING'}, Key: ${supabaseAnonKey ? 'SET' : 'MISSING'}`);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ [SEARCH-API] Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing',
        details: 'Environment variables not configured'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log(`🔍 [SEARCH-API] Supabase client created successfully`);

    // Simple search in words table
    console.log(`🔍 [SEARCH-API] Executing search query: SELECT * FROM words WHERE word ILIKE '%${query}%' LIMIT ${limit}`);
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select('id, word, definition, example')
      .ilike('word', `%${query}%`)
      .limit(limit);

    console.log(`🔍 [SEARCH-API] Search query result - Data: ${words ? `${words.length} results` : 'NULL'}, Error: ${wordsError ? wordsError.code : 'NONE'}`);

    if (wordsError) {
      console.error(`❌ [SEARCH-API] Database search error:`, {
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
        console.warn('Invalid word data found:', word);
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

    console.log(`✅ [SEARCH-API] Found ${results.length} results for "${query}"`);
    
    const response = NextResponse.json(results);
    
    // Cache search results for 5 minutes
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response;

  } catch (error) {
    console.error('❌ [SEARCH-API] Unexpected error in search API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}