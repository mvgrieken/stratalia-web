import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type ChallengeProgress = {
  progress: number;
  completed_at: string | null;
  points_earned: number;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type') || 'all';

    console.log(`🎯 Fetching challenges - User: ${userId}, Type: ${type}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get active challenges
    let query = supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: challenges, error: challengesError } = await query;

    if (challengesError) {
      console.error('❌ Error fetching challenges:', challengesError);
      return NextResponse.json({
        error: 'Failed to fetch challenges',
        details: challengesError.message
      }, { status: 500 });
    }

    // If user_id provided, get user progress for challenges
    let userProgress: Record<string, ChallengeProgress> = {};
    if (userId) {
      const { data: progress, error: progressError } = await supabase
        .from('user_challenges')
        .select('challenge_id, progress, completed_at, points_earned')
        .eq('user_id', userId);

      if (!progressError && progress) {
        userProgress = progress.reduce((acc, item) => {
          acc[item.challenge_id] = {
            progress: item.progress,
            completed_at: item.completed_at,
            points_earned: item.points_earned
          };
          return acc;
        }, {} as Record<string, ChallengeProgress>);
      }
    }

    // Combine challenges with user progress
    const challengesWithProgress = challenges?.map(challenge => ({
      ...challenge,
      user_progress: userProgress[challenge.id] || {
        progress: 0,
        completed_at: null,
        points_earned: 0
      }
    })) || [];

    return NextResponse.json({
      challenges: challengesWithProgress,
      total_challenges: challengesWithProgress.length
    });

  } catch (error) {
    console.error('💥 Error in challenges API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, challenge_id, progress, completed } = await request.json();

    if (!user_id || !challenge_id) {
      return NextResponse.json({
        error: 'user_id and challenge_id are required'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Server configuration error'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({
        error: 'Challenge not found'
      }, { status: 404 });
    }

    // Update or create user challenge progress
    const updateData: any = {
      user_id,
      challenge_id,
      progress: progress || 0
    };

    if (completed) {
      updateData.completed_at = new Date().toISOString();
      updateData.points_earned = challenge.reward_points;
    }

    const { data: _userChallenge, error: updateError } = await supabase
      .from('user_challenges')
      .upsert(updateData)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user challenge:', updateError);
      return NextResponse.json({
        error: 'Failed to update challenge progress',
        details: updateError.message
      }, { status: 500 });
    }

    // If challenge completed, award points
    if (completed) {
      const pointsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gamification/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          points: challenge.reward_points,
          action_type: 'challenge_completed',
          metadata: { challenge_id, challenge_title: challenge.title }
        })
      });

      if (!pointsResponse.ok) {
        console.error('❌ Failed to award points for challenge completion');
      }
    }

    return NextResponse.json({
      success: true,
      user_challenge: _userChallenge,
      points_awarded: completed ? challenge.reward_points : 0
    });

  } catch (error) {
    console.error('💥 Error in challenge update API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}