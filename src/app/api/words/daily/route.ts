import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`📅 Fetching daily word for: ${today}`);

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
      console.error('❌ Error fetching daily word:', dailyError);
      return NextResponse.json({ 
        error: 'Database unavailable', 
        details: dailyError.message 
      }, { status: 500 });
    }

    // If no word for today, get a random word
    if (!dailyWord) {
      console.log('📝 No daily word found, selecting random word...');
      
      const { data: randomWord, error: randomError } = await supabase
        .from('words')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (randomError) {
        console.error('❌ Error fetching random word:', randomError);
        return NextResponse.json({ 
          error: 'Database unavailable', 
          details: randomError.message 
        }, { status: 500 });
      }

      // Create a new daily word entry
      const { error: insertError } = await supabase
        .from('word_of_the_day')
        .insert({
          word_id: randomWord.id,
          date: today
        });

      if (insertError) {
        console.error('⚠️ Error inserting daily word:', insertError);
        // Continue anyway, we still have the word
      }

      console.log(`✅ Selected random word: ${randomWord.word}`);
      return NextResponse.json({
        id: randomWord.id,
        word: randomWord.word,
        meaning: randomWord.definition,
        example: randomWord.example,
        date: today
      });
    }

    // Return the existing daily word
    const word = dailyWord.words;
    console.log(`✅ Found existing daily word: ${word.word}`);
    return NextResponse.json({
      id: word.id,
      word: word.word,
      meaning: word.definition,
      example: word.example,
      date: dailyWord.date
    });

  } catch (error) {
    console.error('💥 Error in daily word API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}