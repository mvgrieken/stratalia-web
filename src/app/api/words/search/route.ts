import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`🔍 Searching for: "${query}" with limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase environment variables are missing!');
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
      console.error('❌ Error searching words:', wordsError);
      return NextResponse.json({
        error: 'Database search failed',
        details: wordsError.message
      }, { status: 500 });
    }

    // Format results
    const results = words?.map(word => ({
      id: word.id,
      word: word.word,
      meaning: word.definition,
      example: word.example,
      match_type: word.word.toLowerCase() === query.toLowerCase() ? 'exact' : 'partial',
      similarity_score: word.word.toLowerCase() === query.toLowerCase() ? 1.0 : 0.8
    })) || [];

    console.log(`✅ Found ${results.length} results for "${query}"`);
    return NextResponse.json(results);

  } catch (error) {
    console.error('💥 Error in search API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}