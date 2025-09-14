import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log(`🔍 Searching for: "${query}" with limit: ${limit}`);

    // Use direct SQL query for search
    const { data: words, error } = await supabase
      .from('words')
      .select('*')
      .or(`word.ilike.%${query}%,definition.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit);

    if (error) {
      console.error('❌ Supabase search error:', error);
      return NextResponse.json({ 
        error: 'Database unavailable', 
        details: error.message 
      }, { status: 500 });
    }

    // Transform data to match frontend expectations
    const results = words?.map((word: any) => ({
      id: word.id,
      word: word.word,
      meaning: word.definition,
      example: word.example,
      match_type: 'fuzzy',
      similarity_score: 0.8
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
