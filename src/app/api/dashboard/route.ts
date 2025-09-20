import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest) => {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      logger.warn('Unauthorized attempt to fetch dashboard data.');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = userData.user.id;

    // Fetch all dashboard data in parallel
    const [
      userPointsResult,
      quizResultsResult,
      submissionsResult,
      dailyProgressResult,
      challengeProgressResult,
      recentActivityResult
    ] = await Promise.allSettled([
      // User points and level
      supabase
        .from('user_points')
        .select('points, level, current_streak, longest_streak')
        .eq('user_id', userId)
        .single(),
      
      // Quiz results
      supabase
        .from('quiz_results')
        .select('score, total_questions, percentage, completed_at, difficulty')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10),
      
      // Community submissions
      supabase
        .from('community_submissions')
        .select('id, status, points_awarded, created_at, like_count')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false }),
      
      // Daily progress
      supabase
        .from('user_daily_progress')
        .select('word_id, word, completed, points_earned, date, created_at')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30),
      
      // Challenge progress
      supabase
        .from('user_challenge_progress')
        .select(`
          id,
          current_progress,
          is_completed,
          completed_at,
          points_earned,
          challenges (
            title,
            description,
            challenge_type,
            difficulty,
            target_value,
            target_metric,
            points_reward
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      
      // Recent activity (combine different sources)
      supabase
        .from('user_daily_progress')
        .select('word, points_earned, created_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Process user points
    const userPoints = userPointsResult.status === 'fulfilled' && userPointsResult.value.data 
      ? userPointsResult.value.data 
      : { points: 0, level: 1, current_streak: 0, longest_streak: 0 };

    // Process quiz results
    const quizResults = quizResultsResult.status === 'fulfilled' && quizResultsResult.value.data 
      ? quizResultsResult.value.data 
      : [];

    // Process submissions
    const submissions = submissionsResult.status === 'fulfilled' && submissionsResult.value.data 
      ? submissionsResult.value.data 
      : [];

    // Process daily progress
    const dailyProgress = dailyProgressResult.status === 'fulfilled' && dailyProgressResult.value.data 
      ? dailyProgressResult.value.data 
      : [];

    // Process challenge progress
    const challengeProgress = challengeProgressResult.status === 'fulfilled' && challengeProgressResult.value.data 
      ? challengeProgressResult.value.data 
      : [];

    // Process recent activity
    const recentActivity = recentActivityResult.status === 'fulfilled' && recentActivityResult.value.data 
      ? recentActivityResult.value.data 
      : [];

    // Calculate comprehensive stats
    const totalPoints = userPoints.points || 0;
    const currentLevel = userPoints.level || 1;
    const currentStreak = userPoints.current_streak || 0;
    const longestStreak = userPoints.longest_streak || 0;
    
    const wordsLearned = dailyProgress.filter(p => p.completed).length;
    const quizzesCompleted = quizResults.length;
    const averageQuizScore = quizResults.length > 0 
      ? quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / quizResults.length 
      : 0;
    
    const submissionsCount = submissions.length;
    const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
    const totalSubmissionPoints = submissions.reduce((sum, s) => sum + (s.points_awarded || 0), 0);
    const totalSubmissionLikes = submissions.reduce((sum, s) => sum + (s.like_count || 0), 0);
    
    const challengesCompleted = challengeProgress.filter(c => c.is_completed).length;
    const totalChallengePoints = challengeProgress.reduce((sum, c) => sum + (c.points_earned || 0), 0);

    // Calculate learning progress by category
    const learningProgress = [
      {
        category: 'Basis Woorden',
        words_learned: Math.floor(wordsLearned * 0.4),
        total_words: 20,
        mastery_percentage: Math.min(Math.floor((wordsLearned * 0.4) / 20 * 100), 100),
        last_activity: dailyProgress.length > 0 ? dailyProgress[0].created_at : new Date().toISOString()
      },
      {
        category: 'Social Media',
        words_learned: Math.floor(wordsLearned * 0.3),
        total_words: 18,
        mastery_percentage: Math.min(Math.floor((wordsLearned * 0.3) / 18 * 100), 100),
        last_activity: dailyProgress.length > 1 ? dailyProgress[1].created_at : new Date().toISOString()
      },
      {
        category: 'Muziek & Cultuur',
        words_learned: Math.floor(wordsLearned * 0.3),
        total_words: 15,
        mastery_percentage: Math.min(Math.floor((wordsLearned * 0.3) / 15 * 100), 100),
        last_activity: dailyProgress.length > 2 ? dailyProgress[2].created_at : new Date().toISOString()
      }
    ];

    // Build recent activity feed
    const activityFeed = [
      // Recent quiz completions
      ...quizResults.slice(0, 3).map(quiz => ({
        id: `quiz-${quiz.completed_at}`,
        type: 'quiz' as const,
        title: 'Quiz Voltooid',
        description: `${quiz.score}/${quiz.total_questions} vragen correct (${Math.round(quiz.percentage || 0)}%)`,
        points_earned: Math.round((quiz.percentage || 0) * 0.5), // 0.5 points per percentage
        timestamp: quiz.completed_at,
        icon: '🧠'
      })),
      
      // Recent words learned
      ...recentActivity.slice(0, 3).map(progress => ({
        id: `word-${progress.created_at}`,
        type: 'word_learned' as const,
        title: 'Woord Geleerd',
        description: `"${progress.word}" toegevoegd aan je vocabulaire`,
        points_earned: progress.points_earned || 10,
        timestamp: progress.created_at,
        icon: '📚'
      })),
      
      // Recent submissions
      ...submissions.slice(0, 2).map(submission => ({
        id: `submission-${submission.id}`,
        type: 'submission' as const,
        title: 'Community Inzending',
        description: `Status: ${submission.status === 'approved' ? 'Goedgekeurd' : submission.status === 'rejected' ? 'Afgewezen' : 'In behandeling'}`,
        points_earned: submission.points_awarded || 0,
        timestamp: submission.created_at,
        icon: '👥'
      })),
      
      // Streak achievements
      ...(currentStreak >= 7 ? [{
        id: 'streak-7',
        type: 'streak' as const,
        title: 'Streak Bonus',
        description: `${currentStreak} dagen streak behaald!`,
        points_earned: Math.floor(currentStreak / 7) * 50,
        timestamp: new Date().toISOString(),
        icon: '🔥'
      }] : [])
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    // Calculate rank (simplified - based on total points)
    const { data: allUsers } = await supabase
      .from('user_points')
      .select('user_id, points')
      .order('points', { ascending: false });
    
    const userRank = allUsers ? allUsers.findIndex(u => u.user_id === userId) + 1 : 1;
    const totalUsers = allUsers ? allUsers.length : 1;

    const dashboardData = {
      stats: {
        total_points: totalPoints,
        level: currentLevel,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        words_learned: wordsLearned,
        quiz_completed: quizzesCompleted,
        average_quiz_score: Math.round(averageQuizScore * 100) / 100,
        challenges_completed: challengesCompleted,
        submissions_count: submissionsCount,
        approved_submissions: approvedSubmissions,
        total_submission_points: totalSubmissionPoints,
        total_submission_likes: totalSubmissionLikes,
        total_challenge_points: totalChallengePoints,
        rank: userRank,
        total_users: totalUsers
      },
      recent_activity: activityFeed,
      learning_progress: learningProgress,
      achievements: {
        total_badges: Math.floor(currentLevel / 2) + challengesCompleted + Math.floor(currentStreak / 7),
        recent_badges: [
          ...(currentLevel >= 5 ? [{ name: 'Level 5 Expert', icon: '🏆', earned_at: new Date().toISOString() }] : []),
          ...(currentStreak >= 7 ? [{ name: 'Week Warrior', icon: '🔥', earned_at: new Date().toISOString() }] : []),
          ...(wordsLearned >= 50 ? [{ name: 'Word Master', icon: '📚', earned_at: new Date().toISOString() }] : [])
        ]
      }
    };

    logger.info(`Dashboard data fetched for user ${userId}: ${totalPoints} points, level ${currentLevel}, ${wordsLearned} words learned`);

    return NextResponse.json({
      success: true,
      ...dashboardData
    });

  } catch (error) {
    logger.error('Dashboard data fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
