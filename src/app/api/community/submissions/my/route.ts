import { NextRequest, NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export const GET = withApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || 'all'; // all, pending, approved, rejected

  const supabase = getSupabaseServiceClient();

  try {
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = user.id;

    // Build query for user's submissions
    let query = supabase
      .from('community_submissions')
      .select(`
        *,
        community_submission_likes!left(action, user_id)
      `)
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      logger.error('Failed to fetch user submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Calculate user stats
    const { data: allSubmissions, error: statsError } = await supabase
      .from('community_submissions')
      .select('status, like_count, dislike_count')
      .eq('submitted_by', userId);

    if (statsError) {
      logger.warn(`Failed to fetch user stats: ${statsError instanceof Error ? statsError.message : String(statsError)}`);
    }

    const stats = {
      total: allSubmissions?.length || 0,
      pending: allSubmissions?.filter(s => s.status === 'pending').length || 0,
      approved: allSubmissions?.filter(s => s.status === 'approved').length || 0,
      rejected: allSubmissions?.filter(s => s.status === 'rejected').length || 0,
      total_likes: allSubmissions?.reduce((sum, s) => sum + (s.like_count || 0), 0) || 0,
      total_dislikes: allSubmissions?.reduce((sum, s) => sum + (s.dislike_count || 0), 0) || 0
    };

    return NextResponse.json({
      submissions: submissions || [],
      stats,
      user_id: userId
    });

  } catch (error) {
    logger.error('My submissions error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
