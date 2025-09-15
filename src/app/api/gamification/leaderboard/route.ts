import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, week, month
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`🏆 Fetching leaderboard - Period: ${period}, Limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      console.error('❌ Error fetching leaderboard:', error);
      
      // Fallback: simple query without RPC
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_points')
        .select(`
          total_points,
          current_level,
          current_streak,
          profiles!inner (
            full_name,
            email
          )
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (fallbackError) {
        return NextResponse.json({
          error: 'Failed to fetch leaderboard',
          details: fallbackError.message
        }, { status: 500 });
      }

      const formattedLeaderboard = fallbackData?.map((item, index) => ({
        rank: index + 1,
        user_id: item.profiles?.email, // Use email as identifier for now
        full_name: item.profiles?.full_name || 'Anonymous',
        total_points: item.total_points || 0,
        current_level: item.current_level || 1,
        current_streak: item.current_streak || 0
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

  } catch (error) {
    console.error('💥 Error in leaderboard API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}