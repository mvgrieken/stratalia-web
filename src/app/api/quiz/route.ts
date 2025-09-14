import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
}

interface _QuizResponse {
  questions: QuizQuestion[];
  total_questions: number;
  difficulty: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'medium';
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log(`🎯 Fetching quiz questions with difficulty: ${difficulty}, limit: ${limit}`);

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

    // Haal quiz vragen op uit Supabase
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select(`
        id,
        question_text,
        correct_answer,
        wrong_answers,
        difficulty,
        words (
          word
        )
      `)
      .eq('is_active', true)
      .eq('difficulty', difficulty)
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching quiz questions:', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    // Transform data to match frontend expectations
    const quizQuestions: QuizQuestion[] = questions?.map((q: any) => ({
      id: q.id,
      word: q.words?.word || 'Unknown',
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      wrong_answers: q.wrong_answers || [],
      difficulty: q.difficulty
    })) || [];

    // Als er geen vragen zijn, return error
    if (quizQuestions.length === 0) {
      console.log('⚠️ No quiz questions found in database');
      return NextResponse.json({
        error: 'No quiz questions available',
        details: 'No questions found in database for the requested difficulty'
      }, { status: 404 });
    }

    console.log(`✅ Found ${quizQuestions.length} quiz questions`);
    return NextResponse.json({
      questions: quizQuestions,
      total_questions: quizQuestions.length,
      difficulty
    });

  } catch (error) {
    console.error('💥 Error in quiz API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
