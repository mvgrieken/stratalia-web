import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    logger.info(`🔍 [DAILY-API] Fetching daily word for: ${today}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    logger.info(`🔍 [DAILY-API] Environment check - URL: ${supabaseUrl ? 'SET' : 'MISSING'}, Key: ${supabaseAnonKey ? 'SET' : 'MISSING'}`);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('❌ [DAILY-API] Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing',
        details: 'Environment variables not configured'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    logger.info(`🔍 [DAILY-API] Supabase client created successfully`);

    // First, try to get today's word of the day
    logger.info(`🔍 [DAILY-API] Querying word_of_the_day for date: ${today}`);
    const { data: dailyWord, error: dailyError } = await supabase
      .from('word_of_the_day')
      .select(`
        *,
        words (*)
      `)
      .eq('date', today)
      .single();

    logger.info(`🔍 [DAILY-API] Daily word query result - Data: ${dailyWord ? 'FOUND' : 'NULL'}, Error: ${dailyError ? dailyError.code : 'NONE'}`);
    
    if (dailyError && dailyError.code !== 'PGRST116') {
      logger.error(`❌ [DAILY-API] Database error:`, {
        code: dailyError.code,
        message: dailyError.message,
        details: dailyError.details,
        hint: dailyError.hint
      });
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: dailyError.message,
        code: dailyError.code
      }, { status: 400 });
    }

    // If no word for today, get a random word
    if (!dailyWord) {
      logger.info('🔍 [DAILY-API] No daily word found, selecting random word...');
      
      const { data: randomWord, error: randomError } = await supabase
        .from('words')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      logger.info(`🔍 [DAILY-API] Random word query result - Data: ${randomWord ? 'FOUND' : 'NULL'}, Error: ${randomError ? randomError.code : 'NONE'}`);

      if (randomError) {
        logger.error(`❌ [DAILY-API] Random word database error:`, {
          code: randomError.code,
          message: randomError.message,
          details: randomError.details
        });
        return NextResponse.json({ 
          error: 'Database query failed', 
          details: randomError.message,
          code: randomError.code
        }, { status: 400 });
      }
      
      // Defensive check for random word data
      if (!randomWord) {
        logger.error('❌ [DAILY-API] No random word found in database');
        return NextResponse.json({
          error: 'Not found',
          details: 'No active words available in database'
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