import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';

interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: string;
}

// Comprehensive fallback quiz questions
const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'fallback-1',
    word: 'skeer',
    question_text: 'Wat betekent het woord "skeer"?',
    correct_answer: 'arm, weinig geld hebben',
    wrong_answers: ['cool, relaxed', 'geweldig, fantastisch', 'boos, gefrustreerd'],
    difficulty: 'easy'
  },
  {
    id: 'fallback-2',
    word: 'breezy',
    question_text: 'Wat betekent het woord "breezy"?',
    correct_answer: 'cool, relaxed',
    wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'geweldig, fantastisch'],
    difficulty: 'easy'
  },
  {
    id: 'fallback-3',
    word: 'flexen',
    question_text: 'Wat betekent het woord "flexen"?',
    correct_answer: 'opscheppen, pronken',
    wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'geweldig, fantastisch'],
    difficulty: 'medium'
  },
  {
    id: 'fallback-4',
    word: 'dope',
    question_text: 'Wat betekent het woord "dope"?',
    correct_answer: 'geweldig, cool',
    wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'boos, gefrustreerd'],
    difficulty: 'medium'
  },
  {
    id: 'fallback-5',
    word: 'lit',
    question_text: 'Wat betekent het woord "lit"?',
    correct_answer: 'geweldig, fantastisch',
    wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'opscheppen, pronken'],
    difficulty: 'medium'
  },
  {
    id: 'fallback-6',
    word: 'fire',
    question_text: 'Wat betekent het woord "fire"?',
    correct_answer: 'geweldig, fantastisch',
    wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'boos, gefrustreerd'],
    difficulty: 'hard'
  },
  {
    id: 'fallback-7',
    word: 'salty',
    question_text: 'Wat betekent het woord "salty"?',
    correct_answer: 'boos, gefrustreerd',
    wrong_answers: ['geweldig, fantastisch', 'cool, relaxed', 'opscheppen, pronken'],
    difficulty: 'hard'
  },
  {
    id: 'fallback-8',
    word: 'vibe',
    question_text: 'Wat betekent het woord "vibe"?',
    correct_answer: 'sfeer, energie',
    wrong_answers: ['arm, weinig geld', 'opscheppen, pronken', 'boos, gefrustreerd'],
    difficulty: 'easy'
  },
  {
    id: 'fallback-9',
    word: 'mood',
    question_text: 'Wat betekent het woord "mood"?',
    correct_answer: 'stemming, gevoel',
    wrong_answers: ['arm, weinig geld', 'cool, relaxed', 'opscheppen, pronken'],
    difficulty: 'easy'
  },
  {
    id: 'fallback-10',
    word: 'goals',
    question_text: 'Wat betekent het woord "goals"?',
    correct_answer: 'doelen, aspiraties',
    wrong_answers: ['arm, weinig geld', 'boos, gefrustreerd', 'opscheppen, pronken'],
    difficulty: 'medium'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty') || 'medium';
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log(`🎯 Fetching quiz questions with difficulty: ${difficulty}, limit: ${limit}`);

    // Try database first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);

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

        if (!error && questions && questions.length > 0) {
          // Transform data to match frontend expectations
          const quizQuestions: QuizQuestion[] = questions.map((q: any) => ({
            id: q.id,
            word: q.words?.word || 'Unknown',
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            wrong_answers: q.wrong_answers || [],
            difficulty: q.difficulty
          }));

          console.log(`✅ Found ${quizQuestions.length} quiz questions from database`);
          return NextResponse.json({
            questions: quizQuestions,
            total_questions: quizQuestions.length,
            difficulty,
            source: 'database'
          });
        }
      } catch (dbError) {
        console.log('Database quiz questions failed, using fallback');
      }
    }

    // Fallback: Use hardcoded questions
    const filteredQuestions = FALLBACK_QUESTIONS
      .filter(q => q.difficulty === difficulty)
      .slice(0, limit);

    // If no questions for specific difficulty, return mixed difficulty
    const questionsToReturn = filteredQuestions.length > 0 
      ? filteredQuestions 
      : FALLBACK_QUESTIONS.slice(0, limit);

    console.log(`✅ Using ${questionsToReturn.length} fallback quiz questions`);
    return NextResponse.json({
      questions: questionsToReturn,
      total_questions: questionsToReturn.length,
      difficulty: questionsToReturn.length > 0 ? questionsToReturn[0].difficulty : difficulty,
      source: 'fallback'
    });

  } catch (error) {
    console.error('💥 Error in quiz API:', error);
    
    // Return emergency fallback questions
    const emergencyQuestions = FALLBACK_QUESTIONS.slice(0, 3);
    return NextResponse.json({
      questions: emergencyQuestions,
      total_questions: emergencyQuestions.length,
      difficulty: 'mixed',
      source: 'error-fallback'
    });
  }
}
