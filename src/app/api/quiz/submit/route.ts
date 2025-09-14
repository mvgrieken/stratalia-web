import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { score, total_questions, time_taken, difficulty = 'medium' } = body;

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
      console.error('Error saving quiz result:', error);
      return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error in quiz submit API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
