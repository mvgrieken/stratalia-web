import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Get current user from session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = getSupabaseServiceClient();
    
    // Get session from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.info(`User ${session.user.email} fetching their points`);

    // Get user's total points
    const { data: userPoints, error: pointsError } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    // Get submission statistics
    const { data: submissions, error: submissionsError } = await supabase
      .from('community_submissions')
      .select('status')
      .eq('submitted_by', userId);

    if (submissionsError) {
      logger.error('Error fetching user submission stats:', submissionsError);
      return NextResponse.json({ error: 'Failed to fetch submission stats', details: submissionsError.message }, { status: 500 });
    }

    // Calculate statistics
    const totalSubmissions = submissions?.length || 0;
    const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
    const totalPoints = userPoints?.points || 0;

    logger.info(`User ${userId} has ${totalPoints} points, ${totalSubmissions} submissions, ${approvedCount} approved`);
    
    return NextResponse.json({
      total_points: totalPoints,
      submissions_count: totalSubmissions,
      approved_count: approvedCount,
      rejected_count: submissions?.filter(s => s.status === 'rejected').length || 0,
      pending_count: submissions?.filter(s => s.status === 'pending').length || 0
    });

  } catch (error) {
    logger.error('Error in /api/profile/points GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
