import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    logger.info(`Fetching daily word for: ${today}`);

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

    // First, try to get today's word of the day
    const { data: dailyWord, error: dailyError } = await supabase
      .from('word_of_the_day')
      .select(`
        *,
        words (*)
      `)
      .eq('date', today)
      .single();

    if (dailyError && dailyError.code !== 'PGRST116') {
      logger.dbError('word_of_the_day', 'SELECT', dailyError);
      return NextResponse.json({ 
        error: 'Database unavailable', 
        details: dailyError.message 
      }, { status: 500 });
    }

    // If no word for today, get a random word
    if (!dailyWord) {
      logger.info('No daily word found, selecting random word...');
      
      const { data: randomWord, error: randomError } = await supabase
        .from('words')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (randomError) {
        logger.dbError('words', 'SELECT', randomError);
        return NextResponse.json({ 
          error: 'Database unavailable', 
          details: randomError.message 
        }, { status: 500 });
      }
      
      // Defensive check for random word data
      if (!randomWord) {
        logger.error('No random word found in database');
        return NextResponse.json({
          error: 'No words available',
          details: 'Database contains no active words'
        }, { status: 404 });
      }

      // Note: We don't insert new daily words as anon user doesn't have INSERT permissions
      // The daily word selection is handled by the system/admin
      logger.info('Skipping daily word insertion (anon user has no INSERT permissions)');

      const duration = Date.now() - startTime;
      logger.performance('daily-word-random', duration);
      logger.info(`Selected random word: ${randomWord.word}`);
      
      const response = NextResponse.json({
        id: randomWord.id,
        word: randomWord.word,
        meaning: randomWord.definition,
        example: randomWord.example,
        date: today
      });
      
      // Cache for 1 hour since daily word changes once per day
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return response;
    }

    // Return the existing daily word
    const word = dailyWord.words;
    
    // Defensive check for word data
    if (!word) {
      logger.error('Daily word found but words relation is null');
      return NextResponse.json({
        error: 'Daily word data incomplete',
        details: 'Word relation is missing'
      }, { status: 500 });
    }
    
    const duration = Date.now() - startTime;
    logger.performance('daily-word-existing', duration);
    logger.info(`Found existing daily word: ${word.word}`);
    
    const response = NextResponse.json({
      id: word.id,
      word: word.word,
      meaning: word.definition,
      example: word.example,
      date: dailyWord.date
    });
    
    // Cache for 1 hour since daily word changes once per day
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.performance('daily-word-error', duration);
    logger.error('Error in daily word API', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}