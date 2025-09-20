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
    logger.warn('Unauthorized attempt to fetch achievements.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Get user stats for achievement calculation
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points, level')
      .eq('user_id', userId)
      .single();

    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('score, total_questions, percentage, completed_at')
      .eq('user_id', userId);

    const { data: dailyProgress } = await supabase
      .from('user_daily_progress')
      .select('word_id, learned_at')
      .eq('user_id', userId);

    const { data: submissions } = await supabase
      .from('community_submissions')
      .select('id, status, points_awarded')
      .eq('submitted_by', userId);

    // Calculate user stats
    const totalPoints = userPoints?.points || 0;
    const currentLevel = userPoints?.level || 1;
    const quizzesCompleted = quizResults?.length || 0;
    const wordsLearned = dailyProgress?.length || 0;
    const submissionsCount = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;

    // Calculate streak
    let currentStreak = 0;
    if (quizResults && quizResults.length > 0) {
      const sortedDates = quizResults
        .map(r => new Date(r.completed_at).toDateString())
        .sort()
        .filter((date, index, arr) => arr.indexOf(date) === index);
      currentStreak = Math.min(sortedDates.length, 7);
    }

    // Calculate average score
    const averageScore = quizResults && quizResults.length > 0 
      ? quizResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / quizResults.length 
      : 0;

    // Define achievements
    const achievements = [
      {
        id: 'first_quiz',
        name: 'Eerste Stappen',
        description: 'Voltooi je eerste quiz',
        icon: '🎯',
        category: 'learning',
        points_reward: 50,
        rarity: 'common',
        is_earned: quizzesCompleted > 0,
        progress: Math.min(quizzesCompleted, 1),
        target: 1
      },
      {
        id: 'word_learner_10',
        name: 'Woordkenner',
        description: 'Leer 10 woorden',
        icon: '📚',
        category: 'learning',
        points_reward: 100,
        rarity: 'common',
        is_earned: wordsLearned >= 10,
        progress: Math.min(wordsLearned, 10),
        target: 10
      },
      {
        id: 'word_learner_25',
        name: 'Woordexpert',
        description: 'Leer 25 woorden',
        icon: '📖',
        category: 'learning',
        points_reward: 200,
        rarity: 'rare',
        is_earned: wordsLearned >= 25,
        progress: Math.min(wordsLearned, 25),
        target: 25
      },
      {
        id: 'word_learner_50',
        name: 'Woordmeester',
        description: 'Leer 50 woorden',
        icon: '🎓',
        category: 'learning',
        points_reward: 300,
        rarity: 'epic',
        is_earned: wordsLearned >= 50,
        progress: Math.min(wordsLearned, 50),
        target: 50
      },
      {
        id: 'streak_3',
        name: 'Streak Starter',
        description: 'Houd een streak van 3 dagen',
        icon: '🔥',
        category: 'streak',
        points_reward: 150,
        rarity: 'common',
        is_earned: currentStreak >= 3,
        progress: Math.min(currentStreak, 3),
        target: 3
      },
      {
        id: 'streak_7',
        name: 'Streak Master',
        description: 'Houd een streak van 7 dagen',
        icon: '🔥🔥',
        category: 'streak',
        points_reward: 300,
        rarity: 'rare',
        is_earned: currentStreak >= 7,
        progress: Math.min(currentStreak, 7),
        target: 7
      },
      {
        id: 'quiz_5',
        name: 'Quiz Lover',
        description: 'Voltooi 5 quizzen',
        icon: '🧠',
        category: 'quiz',
        points_reward: 200,
        rarity: 'common',
        is_earned: quizzesCompleted >= 5,
        progress: Math.min(quizzesCompleted, 5),
        target: 5
      },
      {
        id: 'quiz_10',
        name: 'Quiz Champion',
        description: 'Voltooi 10 quizzen',
        icon: '🏆',
        category: 'quiz',
        points_reward: 400,
        rarity: 'epic',
        is_earned: quizzesCompleted >= 10,
        progress: Math.min(quizzesCompleted, 10),
        target: 10
      },
      {
        id: 'high_score',
        name: 'Score Master',
        description: 'Behaal een gemiddelde score van 80%',
        icon: '⭐',
        category: 'performance',
        points_reward: 250,
        rarity: 'rare',
        is_earned: averageScore >= 80,
        progress: Math.min(averageScore, 80),
        target: 80
      },
      {
        id: 'contributor',
        name: 'Bijdrager',
        description: 'Dien je eerste woord in',
        icon: '✍️',
        category: 'community',
        points_reward: 100,
        rarity: 'common',
        is_earned: submissionsCount > 0,
        progress: Math.min(submissionsCount, 1),
        target: 1
      },
      {
        id: 'approved_contributor',
        name: 'Goedgekeurde Bijdrager',
        description: 'Krijg je eerste inzending goedgekeurd',
        icon: '✅',
        category: 'community',
        points_reward: 200,
        rarity: 'rare',
        is_earned: approvedSubmissions > 0,
        progress: Math.min(approvedSubmissions, 1),
        target: 1
      },
      {
        id: 'level_5',
        name: 'Level 5',
        description: 'Bereik level 5',
        icon: '🎖️',
        category: 'level',
        points_reward: 500,
        rarity: 'epic',
        is_earned: currentLevel >= 5,
        progress: Math.min(currentLevel, 5),
        target: 5
      },
      {
        id: 'level_10',
        name: 'Level 10',
        description: 'Bereik level 10',
        icon: '👑',
        category: 'level',
        points_reward: 1000,
        rarity: 'legendary',
        is_earned: currentLevel >= 10,
        progress: Math.min(currentLevel, 10),
        target: 10
      }
    ];

    // Calculate achievement stats
    const totalAchievements = achievements.length;
    const earnedAchievements = achievements.filter(a => a.is_earned).length;
    const totalPointsFromAchievements = achievements
      .filter(a => a.is_earned)
      .reduce((sum, a) => sum + a.points_reward, 0);

    logger.info(`Achievements fetched: userId=${userId}, earned=${earnedAchievements}/${totalAchievements}`);

    return NextResponse.json({
      success: true,
      achievements,
      stats: {
        total_achievements: totalAchievements,
        earned_achievements: earnedAchievements,
        total_points_from_achievements: totalPointsFromAchievements,
        completion_percentage: Math.round((earnedAchievements / totalAchievements) * 100)
      }
    });

  } catch (error) {
    logger.error('Achievements fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
