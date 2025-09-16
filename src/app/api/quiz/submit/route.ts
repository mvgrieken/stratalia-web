import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, total_questions, time_taken, difficulty = 'medium' } = body;
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // For now, we'll save without user authentication
    // In a real app, you'd get the user ID from the session
    const { data, error } = await supabase
      .from('quiz_sessions')
      .insert({
        score,
        total_questions,
        correct_answers: score,
        time_taken,
        difficulty,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();
    if (error) {
      logger.error('Error saving quiz result:', error);
      return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    logger.error('Error in quiz submit API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
