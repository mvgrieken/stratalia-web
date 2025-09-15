import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';

// Comprehensive fallback data for search
const FALLBACK_WORDS = [
  { id: '1', word: 'skeer', meaning: 'arm, weinig geld hebben', example: 'Ik ben helemaal skeer deze maand.' },
  { id: '2', word: 'breezy', meaning: 'cool, relaxed', example: 'Die nieuwe sneakers zijn echt breezy.' },
  { id: '3', word: 'flexen', meaning: 'opscheppen, pronken', example: 'Hij flexte met zijn nieuwe auto.' },
  { id: '4', word: 'chill', meaning: 'relaxed, kalm', example: 'Laten we gewoon chillen vandaag.' },
  { id: '5', word: 'swag', meaning: 'stijl, cool', example: 'Die outfit heeft echt swag.' },
  { id: '6', word: 'dope', meaning: 'geweldig, cool', example: 'Die nieuwe track is echt dope.' },
  { id: '7', word: 'lit', meaning: 'geweldig, fantastisch', example: 'Het feest was echt lit gisteren.' },
  { id: '8', word: 'salty', meaning: 'boos, gefrustreerd', example: 'Hij is salty omdat hij verloor.' },
  { id: '9', word: 'savage', meaning: 'brutaal, meedogenloos', example: 'Die comeback was echt savage.' },
  { id: '10', word: 'fire', meaning: 'geweldig, fantastisch', example: 'Die nieuwe sneakers zijn fire.' },
  { id: '11', word: 'goals', meaning: 'doelen, aspiraties', example: 'Jullie relatie is echt goals.' },
  { id: '12', word: 'mood', meaning: 'stemming, gevoel', example: 'Dit is echt mijn mood vandaag.' },
  { id: '13', word: 'vibe', meaning: 'sfeer, energie', example: 'Ik hou van de vibe hier.' },
  { id: '14', word: 'slay', meaning: 'het geweldig doen', example: 'Ze slayed die presentatie.' },
  { id: '15', word: 'stan', meaning: 'fan zijn van', example: 'Ik stan deze artiest echt.' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Query parameter is required',
        details: 'Please provide a search query'
      }, { status: 400 });
    }

    const searchQuery = query.trim().toLowerCase();

    // Try database search first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);
        
        const { data: words, error } = await supabase
          .from('words')
          .select('id, word, definition, example, meaning')
          .or(`word.ilike.%${searchQuery}%,definition.ilike.%${searchQuery}%,meaning.ilike.%${searchQuery}%`)
          .limit(limit);

        if (!error && words && words.length > 0) {
          const results = words.map(word => ({
            id: word.id,
            word: word.word,
            meaning: word.definition || word.meaning || '',
            example: word.example || '',
            match_type: word.word.toLowerCase() === searchQuery ? 'exact' : 'partial',
            similarity_score: word.word.toLowerCase() === searchQuery ? 1.0 : 0.8
          }));

          const response = NextResponse.json(results);
          response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
          return response;
        }
      } catch (dbError) {
        console.log('Database search failed, using fallback data');
      }
    }

    // Fallback: Search in hardcoded data
    const results = FALLBACK_WORDS
      .filter(word => 
        word.word.toLowerCase().includes(searchQuery) ||
        word.meaning.toLowerCase().includes(searchQuery)
      )
      .slice(0, limit)
      .map(word => ({
        id: word.id,
        word: word.word,
        meaning: word.meaning,
        example: word.example,
        match_type: word.word.toLowerCase() === searchQuery ? 'exact' : 'partial',
        similarity_score: word.word.toLowerCase() === searchQuery ? 1.0 : 0.8
      }));

    // If no results found, return helpful message
    if (results.length === 0) {
      return NextResponse.json({
        results: [],
        message: `Geen resultaten gevonden voor "${query}". Probeer een ander woord.`,
        suggestions: FALLBACK_WORDS.slice(0, 3).map(w => w.word)
      });
    }

    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response;

  } catch (error) {
    console.error('❌ [SEARCH-API] Unexpected error:', error);
    
    // Return fallback results even on error
    const fallbackResults = FALLBACK_WORDS.slice(0, 5).map(word => ({
      id: word.id,
      word: word.word,
      meaning: word.meaning,
      example: word.example,
      match_type: 'fallback' as const,
      similarity_score: 0.5
    }));

    return NextResponse.json(fallbackResults);
  }
}