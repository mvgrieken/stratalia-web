import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
type LeaderboardItem = {
  id: string;
  full_name: string;
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
};
type FormattedLeaderboardItem = {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  avatar_url?: string;
};
// Enhanced mock leaderboard data
const MOCK_LEADERBOARD: FormattedLeaderboardItem[] = [
  {
    rank: 1,
    user_id: 'demo-1',
    full_name: 'Alex van der Berg',
    total_points: 2450,
    current_level: 8,
    current_streak: 12,
    longest_streak: 25,
    avatar_url: '/avatars/alex.jpg'
  },
  {
    rank: 2,
    user_id: 'demo-2',
    full_name: 'Sofia Martinez',
    total_points: 2180,
    current_level: 7,
    current_streak: 8,
    longest_streak: 18,
    avatar_url: '/avatars/sofia.jpg'
  },
  {
    rank: 3,
    user_id: 'demo-3',
    full_name: 'Mohammed Hassan',
    total_points: 1950,
    current_level: 6,
    current_streak: 15,
    longest_streak: 22,
    avatar_url: '/avatars/mohammed.jpg'
  },
  {
    rank: 4,
    user_id: 'demo-4',
    full_name: 'Emma de Vries',
    total_points: 1720,
    current_level: 6,
    current_streak: 5,
    longest_streak: 12,
    avatar_url: '/avatars/emma.jpg'
  },
  {
    rank: 5,
    user_id: 'demo-5',
    full_name: 'Liam O\'Connor',
    total_points: 1580,
    current_level: 5,
    current_streak: 3,
    longest_streak: 8,
    avatar_url: '/avatars/liam.jpg'
  },
  {
    rank: 6,
    user_id: 'demo-6',
    full_name: 'Zara Ahmed',
    total_points: 1420,
    current_level: 5,
    current_streak: 7,
    longest_streak: 15,
    avatar_url: '/avatars/zara.jpg'
  },
  {
    rank: 7,
    user_id: 'demo-7',
    full_name: 'Noah van Dijk',
    total_points: 1280,
    current_level: 4,
    current_streak: 2,
    longest_streak: 6,
    avatar_url: '/avatars/noah.jpg'
  },
  {
    rank: 8,
    user_id: 'demo-8',
    full_name: 'Luna Rodriguez',
    total_points: 1150,
    current_level: 4,
    current_streak: 9,
    longest_streak: 14,
    avatar_url: '/avatars/luna.jpg'
  },
  {
    rank: 9,
    user_id: 'demo-9',
    full_name: 'Finn Bakker',
    total_points: 980,
    current_level: 3,
    current_streak: 4,
    longest_streak: 9,
    avatar_url: '/avatars/finn.jpg'
  },
  {
    rank: 10,
    user_id: 'demo-10',
    full_name: 'Maya Singh',
    total_points: 850,
    current_level: 3,
    current_streak: 1,
    longest_streak: 5,
    avatar_url: '/avatars/maya.jpg'
  }
];
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, week, month
    const limit = parseInt(searchParams.get('limit') || '10');
    logger.info(`🏆 Fetching leaderboard - Period: ${period}, Limit: ${limit}`);
    // Try database first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);
    // Build date filter based on period
    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND last_activity_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'month') {
      dateFilter = "AND last_activity_date >= CURRENT_DATE - INTERVAL '30 days'";
    }
    // Get leaderboard data
    const { data: leaderboard, error } = await supabase
      .rpc('get_leaderboard', {
        period_filter: dateFilter,
        limit_count: limit
      });
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error fetching leaderboard:', normalized);
      // Fallback: simple query without RPC - use RPC to avoid RLS issues
      const { data: fallbackData, error: fallbackError } = await supabase
        .rpc('get_simple_leaderboard', { limit_count: limit });
      if (fallbackError) {
        logger.info('❌ RPC fallback failed, using mock data for demo');
        // Use enhanced mock data
        const limitedMockData = MOCK_LEADERBOARD.slice(0, limit);
        return NextResponse.json({
          period,
          total_users: limitedMockData.length,
          leaderboard: limitedMockData,
          source: 'mock'
        });
      }
      const formattedLeaderboard: FormattedLeaderboardItem[] = fallbackData?.map((item: LeaderboardItem, index: number) => ({
        rank: index + 1,
        user_id: item.id || `user_${index}`,
        full_name: item.full_name || 'Anonymous',
        total_points: item.total_points || 0,
        current_level: item.level || 1,
        current_streak: item.current_streak || 0,
        longest_streak: item.longest_streak || 0
      })) || [];
      return NextResponse.json({
        period,
        total_users: formattedLeaderboard.length,
        leaderboard: formattedLeaderboard
      });
    }
        return NextResponse.json({
          period,
          total_users: leaderboard?.length || 0,
          leaderboard: leaderboard || []
        });
      } catch (dbError) {
        logger.info('Database connection failed, using mock data');
      }
    }
    // Fallback: Use mock data
    const limitedMockData = MOCK_LEADERBOARD.slice(0, limit);
    logger.info(`✅ Using ${limitedMockData.length} mock leaderboard entries`);
    return NextResponse.json({
      period,
      total_users: limitedMockData.length,
      leaderboard: limitedMockData,
      source: 'mock'
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in leaderboard API:', normalized);
    // Return emergency fallback
    const emergencyData = MOCK_LEADERBOARD.slice(0, 5);
    return NextResponse.json({
      period: 'all',
      total_users: emergencyData.length,
      leaderboard: emergencyData,
      source: 'error-fallback'
    });
  }
}