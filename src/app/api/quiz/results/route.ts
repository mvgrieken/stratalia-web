import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const quizResultSchema = z.object({
  score: z.number().min(0),
  totalQuestions: z.number().min(1),
  percentage: z.number().min(0).max(100),
  timeTaken: z.number().min(0),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  questions: z.array(z.object({
    questionId: z.string(),
    word: z.string(),
    difficulty: z.string()
  })),
  correctAnswers: z.array(z.string()),
  wrongAnswers: z.array(z.object({
    question: z.string(),
    selected: z.string(),
    correct: z.string()
  }))
});

export const dynamic = 'force-dynamic';

export const POST = withApiError(withZod(quizResultSchema, async (request: NextRequest) => {
  const quizData = await request.json();
  const supabase = getSupabaseServiceClient();

  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    logger.warn('Unauthorized attempt to save quiz result.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Save quiz result
    const { data: result, error: insertError } = await supabase
      .from('quiz_results')
      .insert([{
        user_id: userId,
        score: quizData.score,
        total_questions: quizData.totalQuestions,
        percentage: quizData.percentage,
        time_taken: quizData.timeTaken,
        difficulty: quizData.difficulty,
        questions: quizData.questions,
        correct_answers: quizData.correctAnswers,
        wrong_answers: quizData.wrongAnswers,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      logger.error(`Failed to save quiz result: ${insertError.message}`);
      return NextResponse.json({ message: 'Failed to save quiz result' }, { status: 500 });
    }

    // Calculate points based on performance
    const basePoints = quizData.score * 10; // 10 points per correct answer
    const timeBonus = Math.max(0, 50 - quizData.timeTaken); // Bonus for quick completion
    const difficultyMultiplier = quizData.difficulty === 'easy' ? 1 : 
                                quizData.difficulty === 'medium' ? 1.5 : 2;
    const totalPoints = Math.round((basePoints + timeBonus) * difficultyMultiplier);

    // Update user points
    const { error: pointsError } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        points: totalPoints,
        level: Math.floor(totalPoints / 100) + 1 // Level based on total points
      }, {
        onConflict: 'user_id'
      });

    if (pointsError) {
      logger.warn(`Failed to update user points: ${pointsError.message}`);
      // Don't fail the request, just log the warning
    }

    // Update user streak (if this is their first quiz today)
    const today = new Date().toISOString().split('T')[0];
    const { data: todayQuiz, error: todayError } = await supabase
      .from('quiz_results')
      .select('id')
      .eq('user_id', userId)
      .gte('completed_at', `${today}T00:00:00Z`)
      .lt('completed_at', `${today}T23:59:59Z`);

    if (!todayError && todayQuiz && todayQuiz.length === 1) {
      // This is their first quiz today, update streak
      const { error: streakError } = await supabase
        .from('users')
        .update({
          // We'll add a streak field to users table if needed
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (streakError) {
        logger.warn(`Failed to update user streak: ${streakError.message}`);
      }
    }

    logger.info(`Quiz result saved successfully: userId=${userId}, score=${quizData.score}, points=${totalPoints}`);

    return NextResponse.json({
      success: true,
      result: result,
      pointsEarned: totalPoints,
      message: `Gefeliciteerd! Je hebt ${totalPoints} punten verdiend.`
    });

  } catch (error) {
    logger.error('Quiz result save error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}));

export const GET = withApiError(async (request: NextRequest) => {
  const supabase = getSupabaseServiceClient();
  
  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    logger.warn('Unauthorized attempt to fetch quiz results.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    // Get user's quiz history
    const { data: results, error: fetchError } = await supabase
      .from('quiz_results')
      .select('id, score, total_questions, percentage, time_taken, difficulty, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      logger.error(`Failed to fetch quiz results: ${fetchError.message}`);
      return NextResponse.json({ message: 'Failed to fetch quiz results' }, { status: 500 });
    }

    // Get user's total stats
    const { data: stats, error: statsError } = await supabase
      .from('quiz_results')
      .select('score, total_questions, percentage, difficulty')
      .eq('user_id', userId);

    if (statsError) {
      logger.warn(`Failed to fetch quiz stats: ${statsError.message}`);
    }

    const totalQuizzes = stats?.length || 0;
    const averageScore = stats && stats.length > 0 
      ? stats.reduce((sum, r) => sum + (r.score || 0), 0) / stats.length 
      : 0;
    const averagePercentage = stats && stats.length > 0 
      ? stats.reduce((sum, r) => sum + (r.percentage || 0), 0) / stats.length 
      : 0;

    return NextResponse.json({
      success: true,
      results: results || [],
      stats: {
        totalQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        bestScore: Math.max(...(stats?.map(s => s.score || 0) || [0]))
      }
    });

  } catch (error) {
    logger.error('Quiz results fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
