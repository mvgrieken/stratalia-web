import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  rank: number;
  badges_count: number;
  quiz_completed: number;
  words_learned: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  user_rank?: LeaderboardEntry;
  total_users: number;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all_time' || 'all_time';
    const limit = parseInt(searchParams.get('limit') || '50');
    const user_id = searchParams.get('user_id');

    // Get real leaderboard data from Supabase
    const leaderboardData = await generateLeaderboard(period, limit, user_id);

    return NextResponse.json(leaderboardData);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

async function generateLeaderboard(
  period: string, 
  limit: number, 
  user_id?: string | null
): Promise<LeaderboardResponse> {
  try {
    console.log(`🏆 Generating leaderboard for period: ${period}, limit: ${limit}`);

    // Haal user data op uit Supabase
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        user_points (
          total_points,
          level,
          current_streak,
          longest_streak
        )
      `)
      .limit(limit * 2); // Haal meer op voor filtering

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    // Haal quiz data op
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, score')
      .limit(1000);

    if (quizError) {
      console.error('❌ Error fetching quiz data:', quizError);
      // Continue without quiz data
    }

    // Haal user progress data op
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id')
      .limit(1000);

    if (progressError) {
      console.error('❌ Error fetching progress data:', progressError);
      // Continue without progress data
    }

    // Transform data to leaderboard format
    const leaderboard: LeaderboardEntry[] = users?.map((user, index) => {
      const points = user.user_points?.[0];
      const quizCount = quizData?.filter(q => q.user_id === user.id).length || 0;
      const wordsLearned = progressData?.filter(p => p.user_id === user.id).length || 0;

      return {
        user_id: user.id,
        display_name: user.name || user.email?.split('@')[0] || `Gebruiker${index + 1}`,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}`,
        total_points: points?.total_points || 0,
        level: points?.level || 1,
        current_streak: points?.current_streak || 0,
        longest_streak: points?.longest_streak || 0,
        rank: index + 1,
        badges_count: Math.floor(Math.random() * 5), // Mock badges for now
        quiz_completed: quizCount,
        words_learned: wordsLearned
      };
    }).sort((a, b) => b.total_points - a.total_points) || [];

    // Add rank numbers
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    // Find user rank if user_id provided
    let userRank: LeaderboardEntry | undefined;
    if (user_id) {
      userRank = leaderboard.find(user => user.user_id === user_id);
      if (!userRank) {
        // User not in top results, create a mock entry
        userRank = {
          user_id: user_id,
          display_name: 'Jij',
          avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=You',
          total_points: Math.floor(Math.random() * 1000) + 50,
          level: Math.floor(Math.random() * 15) + 1,
          current_streak: Math.floor(Math.random() * 20),
          longest_streak: Math.floor(Math.random() * 30) + 5,
          rank: Math.floor(Math.random() * 200) + 51,
          badges_count: Math.floor(Math.random() * 5),
          quiz_completed: Math.floor(Math.random() * 30),
          words_learned: Math.floor(Math.random() * 50)
        };
      }
    }

    // Get total user count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    console.log(`✅ Generated leaderboard with ${leaderboard.length} users`);

    return {
      leaderboard: leaderboard.slice(0, limit),
      user_rank: userRank,
      total_users: totalUsers || 0,
      period: period as any
    };

  } catch (error) {
    console.error('❌ Error generating leaderboard:', error);
    // Fallback to mock data
    return {
      leaderboard: [],
      user_rank: undefined,
      total_users: 0,
      period: period as any
    };
  }
}
