import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
}

interface QuizResponse {
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

    // Als er geen vragen zijn, maak mock vragen
    if (quizQuestions.length === 0) {
      console.log('⚠️ No quiz questions found, creating mock questions');
      const mockQuestions: QuizQuestion[] = [
        {
          id: 'mock-1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'cool', 'moe'],
          difficulty: 'medium'
        },
        {
          id: 'mock-2',
          word: 'fissa',
          question_text: 'Wat betekent "fissa"?',
          correct_answer: 'feest, party',
          wrong_answers: ['eten', 'slapen', 'werken'],
          difficulty: 'medium'
        },
        {
          id: 'mock-3',
          word: 'waggie',
          question_text: 'Wat betekent "waggie"?',
          correct_answer: 'auto',
          wrong_answers: ['fiets', 'bus', 'trein'],
          difficulty: 'easy'
        }
      ];
      
      return NextResponse.json({
        questions: mockQuestions.slice(0, limit),
        total_questions: mockQuestions.length,
        difficulty
      });
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
