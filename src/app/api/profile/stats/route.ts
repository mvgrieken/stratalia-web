import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest) => {
  const supabase = getSupabaseServiceClient();
  
  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    logger.warn('Unauthorized attempt to fetch profile stats.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Get user points and level
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('points, level')
      .eq('user_id', userId)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error(`Failed to fetch user points: ${pointsError.message}`);
    }

    // Get quiz results
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_results')
      .select('score, total_questions, percentage, completed_at')
      .eq('user_id', userId);

    if (quizError) {
      logger.error(`Failed to fetch quiz results: ${quizError.message}`);
    }

    // Get community submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('community_submissions')
      .select('id, status, points_awarded, created_at')
      .eq('submitted_by', userId);

    if (submissionsError) {
      logger.error(`Failed to fetch submissions: ${submissionsError.message}`);
    }

    // Get daily word progress (if we have a user_daily_progress table)
    const { data: dailyProgress, error: dailyError } = await supabase
      .from('user_daily_progress')
      .select('word_id, learned_at')
      .eq('user_id', userId);

    if (dailyError && dailyError.code !== 'PGRST116') {
      logger.warn(`Failed to fetch daily progress: ${dailyError.message}`);
    }

    // Calculate stats
    const totalPoints = userPoints?.points || 0;
    const currentLevel = userPoints?.level || 1;
    const quizzesCompleted = quizResults?.length || 0;
    const averageScore = quizResults && quizResults.length > 0 
      ? quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / quizResults.length 
      : 0;
    const wordsLearned = dailyProgress?.length || 0;
    const submissionsCount = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;

    // Calculate streak (simplified - count consecutive days with activity)
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (quizResults && quizResults.length > 0) {
      const sortedDates = quizResults
        .map(r => new Date(r.completed_at).toDateString())
        .sort()
        .filter((date, index, arr) => arr.indexOf(date) === index); // Remove duplicates
      
      // Simple streak calculation
      currentStreak = Math.min(sortedDates.length, 7); // Simplified to max 7 for now
      longestStreak = sortedDates.length;
    }

    const stats = {
      total_points: totalPoints,
      current_level: currentLevel,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      words_learned: wordsLearned,
      quizzes_completed: quizzesCompleted,
      average_score: Math.round(averageScore * 100) / 100,
      submissions_count: submissionsCount,
      approved_submissions: approvedSubmissions,
      total_submission_points: submissions?.reduce((sum, s) => sum + (s.points_awarded || 0), 0) || 0
    };

    logger.info(`Profile stats fetched: userId=${userId}, points=${totalPoints}, level=${currentLevel}`);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Profile stats fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
