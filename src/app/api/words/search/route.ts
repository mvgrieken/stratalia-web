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

    // Search in words table with fuzzy matching
    const { data: words, error: wordsError } = await supabase
      .from('words')
      .select(`
        id,
        word,
        meaning,
        example,
        word_variants (
          id,
          variant,
          meaning,
          example
        )
      `)
      .or(`word.ilike.%${query}%,meaning.ilike.%${query}%`)
      .limit(limit);

    if (wordsError) {
      console.error('❌ Error searching words:', wordsError);
      return NextResponse.json({
        error: 'Database search failed',
        details: wordsError.message
      }, { status: 500 });
    }

    // Also search in word_variants
    const { data: variants, error: variantsError } = await supabase
      .from('word_variants')
      .select(`
        id,
        variant,
        meaning,
        example,
        words!inner (
          id,
          word
        )
      `)
      .or(`variant.ilike.%${query}%,meaning.ilike.%${query}%`)
      .limit(limit);

    if (variantsError) {
      console.error('❌ Error searching variants:', variantsError);
    }

    // Combine and format results
    const results: any[] = [];
    
    // Add main words
    if (words) {
      words.forEach(word => {
        results.push({
          id: word.id,
          word: word.word,
          meaning: word.meaning,
          example: word.example,
          match_type: word.word.toLowerCase() === query.toLowerCase() ? 'exact' : 'partial',
          similarity_score: word.word.toLowerCase() === query.toLowerCase() ? 1.0 : 0.8
        });
      });
    }

    // Add variants
    if (variants) {
      variants.forEach(variant => {
        results.push({
          id: `variant_${variant.id}`,
          word: variant.variant,
          meaning: variant.meaning,
          example: variant.example,
          parent_word: (variant.words as any).word,
          match_type: variant.variant.toLowerCase() === query.toLowerCase() ? 'exact' : 'partial',
          similarity_score: variant.variant.toLowerCase() === query.toLowerCase() ? 1.0 : 0.7
        });
      });
    }

    // Sort by similarity score and remove duplicates
    const uniqueResults = results
      .filter((result, index, self) => 
        index === self.findIndex(r => r.word === result.word)
      )
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);

    console.log(`✅ Found ${uniqueResults.length} results for "${query}"`);
    return NextResponse.json(uniqueResults);

  } catch (error) {
    console.error('💥 Error in search API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
