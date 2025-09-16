import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
interface LearningRequest {
  user_id?: string;
  word_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  response_time: number;
  correct: boolean;
  attempts: number;
}
interface LearningResponse {
  next_difficulty: 'easy' | 'medium' | 'hard';
  recommended_words: string[];
  learning_path: string[];
  mastery_score: number;
  next_review_time: string;
}
export async function POST(request: NextRequest) {
  try {
    const body: LearningRequest = await request.json();
    const { word_id, difficulty } = body;
    if (!word_id || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Adaptive learning algorithm
    const learningResponse = await calculateAdaptiveLearning(body);
    return NextResponse.json(learningResponse);
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Error in adaptive learning:', normalized);
    return NextResponse.json({ error: 'Learning analysis failed' }, { status: 500 });
  }
}
async function calculateAdaptiveLearning(request: LearningRequest): Promise<LearningResponse> {
  const { difficulty: _difficulty, response_time: _response_time, correct: _correct, attempts: _attempts } = request;
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error('❌ Supabase environment variables are missing!');
    throw new Error('Database configuration missing');
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  // Calculate mastery score based on performance
  let masteryScore = 0.5; // Base score
  // Adjust based on correctness
  if (_correct) {
    masteryScore += 0.3;
  } else {
    masteryScore -= 0.2;
  }
  // Adjust based on response time (faster = better)
  const optimalTime = 3000; // 3 seconds
  const timeScore = Math.max(0, 1 - (_response_time - optimalTime) / optimalTime);
  masteryScore += timeScore * 0.2;
  // Adjust based on attempts (fewer attempts = better)
  const attemptScore = Math.max(0, 1 - (_attempts - 1) * 0.1);
  masteryScore += attemptScore * 0.1;
  // Clamp between 0 and 1
  masteryScore = Math.max(0, Math.min(1, masteryScore));
  // Determine next difficulty
  let nextDifficulty: 'easy' | 'medium' | 'hard' = _difficulty;
  if (masteryScore >= 0.8) {
    // High mastery - increase difficulty
    if (_difficulty === 'easy') nextDifficulty = 'medium';
    else if (_difficulty === 'medium') nextDifficulty = 'hard';
  } else if (masteryScore <= 0.4) {
    // Low mastery - decrease difficulty
    if (_difficulty === 'hard') nextDifficulty = 'medium';
    else if (_difficulty === 'medium') nextDifficulty = 'easy';
  }
  // Generate recommended words based on learning patterns
  const recommendedWords = await generateRecommendedWords(masteryScore, _difficulty, supabase);
  // Create learning path
  const learningPath = generateLearningPath(masteryScore);
  // Calculate next review time (spaced repetition)
  const nextReviewTime = calculateNextReviewTime(masteryScore, _attempts);
  return {
    next_difficulty: nextDifficulty,
    recommended_words: recommendedWords,
    learning_path: learningPath,
    mastery_score: masteryScore,
    next_review_time: nextReviewTime
  };
}
async function generateRecommendedWords(masteryScore: number, difficulty: string, supabase: any): Promise<string[]> {
  try {
    // Get real word recommendations from Supabase based on difficulty
    const { data: words, error } = await supabase
      .from('words')
      .select('word')
      .eq('is_active', true)
      .limit(10);
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error fetching recommended words:', normalized);
      return [];
    }
    if (!words || words.length === 0) {
      return [];
    }
    // Return words based on difficulty and mastery score
    const wordList = words.map((w: any) => w.word);
    // Simple difficulty-based filtering
    if (difficulty === 'easy') {
      return wordList.slice(0, 5);
    } else if (difficulty === 'medium') {
      return wordList.slice(0, 7);
    } else {
      return wordList.slice(0, 10);
    }
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('❌ Error in generateRecommendedWords:', normalized);
    return [];
  }
}
function generateLearningPath(masteryScore: number): string[] {
  const paths = {
    beginner: [
      'Basis woorden leren',
      'Eenvoudige quizzen',
      'Woord van de dag volgen',
      'Community woorden bekijken'
    ],
    intermediate: [
      'Middelmatige woorden oefenen',
      'Complexere quizzen',
      'Context begrijpen',
      'Eigen woorden toevoegen'
    ],
    advanced: [
      'Moeilijke woorden beheersen',
      'Uitdagende quizzen',
      'Etymologie begrijpen',
      'Anderen helpen leren'
    ]
  };
  if (masteryScore >= 0.7) return paths.advanced;
  if (masteryScore >= 0.4) return paths.intermediate;
  return paths.beginner;
}
function calculateNextReviewTime(masteryScore: number, attempts: number): string {
  // Spaced repetition algorithm
  let hours = 24; // Base: 1 day
  if (masteryScore >= 0.8) {
    // High mastery - review less frequently
    hours = 24 * 7; // 1 week
  } else if (masteryScore >= 0.6) {
    // Medium mastery - review in a few days
    hours = 24 * 3; // 3 days
  } else if (masteryScore >= 0.4) {
    // Low mastery - review soon
    hours = 24; // 1 day
  } else {
    // Very low mastery - review very soon
    hours = 6; // 6 hours
  }
  // Adjust based on attempts
  if (attempts > 3) {
    hours = Math.max(1, hours / 2); // Review sooner if many attempts
  }
  const nextReview = new Date();
  nextReview.setHours(nextReview.getHours() + hours);
  return nextReview.toISOString();
}
