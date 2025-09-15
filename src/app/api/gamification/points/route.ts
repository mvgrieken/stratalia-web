import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
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

    // Get user points
    const { data: userPoints, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching user points:', error);
      return NextResponse.json({
        error: 'Failed to fetch user points',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json(userPoints);

  } catch (error) {
    console.error('💥 Error in points API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, points, action_type, metadata } = await request.json();

    if (!user_id || !points || !action_type) {
      return NextResponse.json({
        error: 'user_id, points, and action_type are required'
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

    // Get current user points
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('❌ Error fetching current points:', fetchError);
      return NextResponse.json({
        error: 'Failed to fetch current points',
        details: fetchError.message
      }, { status: 500 });
    }

    const newTotalPoints = (currentPoints?.total_points || 0) + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1; // 100 points per level

    // Update or create user points
    const { data: updatedPoints, error: updateError } = await supabase
      .from('user_points')
      .upsert({
        user_id,
        total_points: newTotalPoints,
        current_level: newLevel,
        current_streak: currentPoints?.current_streak || 0,
        longest_streak: currentPoints?.longest_streak || 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating user points:', updateError);
      return NextResponse.json({
        error: 'Failed to update user points',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      points_earned: points,
      total_points: newTotalPoints,
      new_level: newLevel,
      action_type
    });

  } catch (error) {
    console.error('💥 Error in points update API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
