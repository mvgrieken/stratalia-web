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
    logger.warn('Unauthorized attempt to fetch challenges.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // daily, weekly, monthly, special
  const status = searchParams.get('status'); // active, completed, upcoming

  try {
    // Get current date for filtering
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    // Build query for challenges
    let query = supabase
      .from('challenges')
      .select(`
        id,
        title,
        description,
        challenge_type,
        difficulty,
        target_value,
        target_metric,
        points_reward,
        start_date,
        end_date,
        is_active
      `)
      .eq('is_active', true);

    // Filter by type if specified
    if (type && ['daily', 'weekly', 'monthly', 'special'].includes(type)) {
      query = query.eq('challenge_type', type);
    }

    // Filter by status
    if (status === 'active') {
      query = query.lte('start_date', now.toISOString()).gte('end_date', now.toISOString());
    } else if (status === 'upcoming') {
      query = query.gt('start_date', now.toISOString());
    } else if (status === 'completed') {
      query = query.lt('end_date', now.toISOString());
    }

    const { data: challenges, error: challengesError } = await query.order('start_date', { ascending: true });

    if (challengesError) {
      logger.error(`Failed to fetch challenges: ${challengesError.message}`);
      return NextResponse.json({ message: 'Failed to fetch challenges' }, { status: 500 });
    }

    // Get user's progress for these challenges
    const challengeIds = challenges?.map(c => c.id) || [];
    let userProgress: any[] = [];
    
    if (challengeIds.length > 0) {
      const { data: progress, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('challenge_id, current_progress, is_completed, completed_at, points_earned')
        .eq('user_id', userId)
        .in('challenge_id', challengeIds);

      if (progressError) {
        logger.warn(`Failed to fetch user progress: ${progressError.message}`);
      } else {
        userProgress = progress || [];
      }
    }

    // Get user stats for progress calculation
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('completed_at')
      .eq('user_id', userId);

    const { data: dailyProgress } = await supabase
      .from('user_daily_progress')
      .select('learned_at')
      .eq('user_id', userId);

    const { data: submissions } = await supabase
      .from('community_submissions')
      .select('created_at')
      .eq('submitted_by', userId);

    // Calculate current user stats
    const userStats = {
      words_learned: dailyProgress?.length || 0,
      quizzes_completed: quizResults?.length || 0,
      submissions_made: submissions?.length || 0,
      points_earned: userPoints?.points || 0,
      streak_days: 0 // Simplified for now
    };

    // Calculate streak (simplified)
    if (quizResults && quizResults.length > 0) {
      const sortedDates = quizResults
        .map(r => new Date(r.completed_at).toDateString())
        .sort()
        .filter((date, index, arr) => arr.indexOf(date) === index);
      userStats.streak_days = Math.min(sortedDates.length, 7);
    }

    // Combine challenges with user progress
    const challengesWithProgress = challenges?.map(challenge => {
      const progress = userProgress.find(p => p.challenge_id === challenge.id);
      const currentProgress = progress?.current_progress || 0;
      const isCompleted = progress?.is_completed || false;
      
      // Calculate current progress based on user stats
      let calculatedProgress = 0;
      switch (challenge.target_metric) {
        case 'words_learned':
          calculatedProgress = userStats.words_learned;
          break;
        case 'quizzes_completed':
          calculatedProgress = userStats.quizzes_completed;
          break;
        case 'submissions_made':
          calculatedProgress = userStats.submissions_made;
          break;
        case 'points_earned':
          calculatedProgress = userStats.points_earned;
          break;
        case 'streak_days':
          calculatedProgress = userStats.streak_days;
          break;
      }

      // Use the higher of stored progress or calculated progress
      const finalProgress = Math.max(currentProgress, calculatedProgress);
      const finalIsCompleted = isCompleted || finalProgress >= challenge.target_value;

      return {
        ...challenge,
        current_progress: finalProgress,
        is_completed: finalIsCompleted,
        progress_percentage: Math.min((finalProgress / challenge.target_value) * 100, 100),
        completed_at: progress?.completed_at || null,
        points_earned: progress?.points_earned || 0
      };
    }) || [];

    // Calculate user challenge stats
    const totalChallenges = challengesWithProgress.length;
    const completedChallenges = challengesWithProgress.filter(c => c.is_completed).length;
    const totalPointsEarned = challengesWithProgress.reduce((sum, c) => sum + c.points_earned, 0);

    logger.info(`Challenges fetched: userId=${userId}, total=${totalChallenges}, completed=${completedChallenges}`);

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
      user_stats: userStats,
      challenge_stats: {
        total_challenges: totalChallenges,
        completed_challenges: completedChallenges,
        total_points_earned: totalPointsEarned,
        completion_percentage: totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0
      }
    });

  } catch (error) {
    logger.error('Challenges fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
