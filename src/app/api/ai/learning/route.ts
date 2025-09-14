import { NextRequest, NextResponse } from 'next/server';

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
    const { user_id: _user_id, word_id, difficulty, response_time: _response_time, correct: _correct, attempts: _attempts } = body;

    if (!word_id || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Adaptive learning algorithm
    const learningResponse = await calculateAdaptiveLearning(body);

    return NextResponse.json(learningResponse);
  } catch (error) {
    console.error('Error in adaptive learning:', error);
    return NextResponse.json({ error: 'Learning analysis failed' }, { status: 500 });
  }
}

async function calculateAdaptiveLearning(request: LearningRequest): Promise<LearningResponse> {
  const { difficulty, response_time, correct, attempts } = request;

  // Calculate mastery score based on performance
  let masteryScore = 0.5; // Base score

  // Adjust based on correctness
  if (correct) {
    masteryScore += 0.3;
  } else {
    masteryScore -= 0.2;
  }

  // Adjust based on response time (faster = better)
  const optimalTime = 3000; // 3 seconds
  const timeScore = Math.max(0, 1 - (response_time - optimalTime) / optimalTime);
  masteryScore += timeScore * 0.2;

  // Adjust based on attempts (fewer attempts = better)
  const attemptScore = Math.max(0, 1 - (attempts - 1) * 0.1);
  masteryScore += attemptScore * 0.1;

  // Clamp between 0 and 1
  masteryScore = Math.max(0, Math.min(1, masteryScore));

  // Determine next difficulty
  let nextDifficulty: 'easy' | 'medium' | 'hard' = difficulty;
  
  if (masteryScore >= 0.8) {
    // High mastery - increase difficulty
    if (difficulty === 'easy') nextDifficulty = 'medium';
    else if (difficulty === 'medium') nextDifficulty = 'hard';
  } else if (masteryScore <= 0.4) {
    // Low mastery - decrease difficulty
    if (difficulty === 'hard') nextDifficulty = 'medium';
    else if (difficulty === 'medium') nextDifficulty = 'easy';
  }

  // Generate recommended words based on learning patterns
  const recommendedWords = generateRecommendedWords(masteryScore, difficulty);

  // Create learning path
  const learningPath = generateLearningPath(masteryScore, difficulty);

  // Calculate next review time (spaced repetition)
  const nextReviewTime = calculateNextReviewTime(masteryScore, attempts);

  return {
    next_difficulty: nextDifficulty,
    recommended_words: recommendedWords,
    learning_path: learningPath,
    mastery_score: masteryScore,
    next_review_time: nextReviewTime
  };
}

function generateRecommendedWords(masteryScore: number, difficulty: string): string[] {
  // Mock word recommendations based on learning patterns
  const wordPools = {
    easy: ['skeer', 'breezy', 'chillen', 'dope', 'swag'],
    medium: ['flexen', 'lit', 'noob', 'salty', 'savage'],
    hard: ['yeet', 'cap', 'bet', 'periodt', 'stan']
  };

  const pool = wordPools[difficulty as keyof typeof wordPools] || wordPools.easy;
  
  // Return 3-5 words based on mastery score
  const count = masteryScore > 0.7 ? 5 : masteryScore > 0.4 ? 4 : 3;
  
  return pool
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

function generateLearningPath(masteryScore: number, _difficulty: string): string[] {
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
