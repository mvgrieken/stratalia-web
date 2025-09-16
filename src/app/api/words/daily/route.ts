import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';
import { normalizeError } from '@/lib/errors';
import { logger } from '@/lib/logger';

// Comprehensive fallback words for daily word feature
const FALLBACK_WORDS = [
  {
    id: 'fallback-1',
    word: 'skeer',
    meaning: 'arm, weinig geld hebben',
    example: 'Ik ben helemaal skeer deze maand.'
  },
  {
    id: 'fallback-2', 
    word: 'breezy',
    meaning: 'cool, relaxed',
    example: 'Die nieuwe sneakers zijn echt breezy.'
  },
  {
    id: 'fallback-3',
    word: 'flexen',
    meaning: 'opscheppen, pronken',
    example: 'Hij flexte met zijn nieuwe auto.'
  },
  {
    id: 'fallback-4',
    word: 'chill',
    meaning: 'relaxed, kalm',
    example: 'Laten we gewoon chillen vandaag.'
  },
  {
    id: 'fallback-5',
    word: 'swag',
    meaning: 'stijl, cool',
    example: 'Die outfit heeft echt swag.'
  },
  {
    id: 'fallback-6',
    word: 'dope',
    meaning: 'geweldig, cool',
    example: 'Die nieuwe track is echt dope.'
  },
  {
    id: 'fallback-7',
    word: 'lit',
    meaning: 'geweldig, fantastisch',
    example: 'Het feest was echt lit gisteren.'
  },
  {
    id: 'fallback-8',
    word: 'fire',
    meaning: 'geweldig, fantastisch',
    example: 'Die nieuwe sneakers zijn fire.'
  },
  {
    id: 'fallback-9',
    word: 'vibe',
    meaning: 'sfeer, energie',
    example: 'Ik hou van de vibe hier.'
  },
  {
    id: 'fallback-10',
    word: 'mood',
    meaning: 'stemming, gevoel',
    example: 'Dit is echt mijn mood vandaag.'
  }
];

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Try to get from database first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);
        
        // First try to get today's specific daily word
        const { data: dailyWord, error: dailyError } = await supabase
          .from('word_of_the_day')
          .select(`
            *,
            words (*)
          `)
          .eq('date', today)
          .single();

        if (!dailyError && dailyWord && dailyWord.words) {
          const response = NextResponse.json({
            id: dailyWord.words.id,
            word: dailyWord.words.word,
            meaning: dailyWord.words.definition || dailyWord.words.meaning || 'Betekenis niet beschikbaar',
            example: dailyWord.words.example || 'Geen voorbeeld beschikbaar',
            date: today,
            source: 'database'
          });
          
          response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
          return response;
        }

        // If no daily word, try to get a random word from database
        const { data: randomWord, error: randomError } = await supabase
          .from('words')
          .select('*')
          .limit(1)
          .single();

        if (!randomError && randomWord) {
          const response = NextResponse.json({
            id: randomWord.id,
            word: randomWord.word,
            meaning: randomWord.definition || randomWord.meaning || 'Betekenis niet beschikbaar',
            example: randomWord.example || 'Geen voorbeeld beschikbaar',
            date: today,
            source: 'database-random'
          });
          
          response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
          return response;
        }
      } catch (dbError) {
        console.log('Database unavailable, using fallback word');
      }
    }

    // Fallback: Return a hardcoded word with consistent daily selection
    const dayOfMonth = new Date().getDate();
    const selectedWord = FALLBACK_WORDS[dayOfMonth % FALLBACK_WORDS.length];

    const response = NextResponse.json({
      id: selectedWord.id,
      word: selectedWord.word,
      meaning: selectedWord.meaning,
      example: selectedWord.example,
      date: today,
      source: 'fallback'
    });
    
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return response;

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ [DAILY-API] Unexpected error', normalized);
    
    // Even on error, return a fallback word
    const emergencyWord = FALLBACK_WORDS[0];
    return NextResponse.json({
      id: emergencyWord.id,
      word: emergencyWord.word,
      meaning: emergencyWord.meaning,
      example: emergencyWord.example,
      date: new Date().toISOString().split('T')[0],
      source: 'error-fallback'
    });
  }
}