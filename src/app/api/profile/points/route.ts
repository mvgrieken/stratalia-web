import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { withApiError } from '@/lib/api-wrapper';

export const GET = withApiError(async (_request: NextRequest) => {
    const supabase = getSupabaseServiceClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    const { data: submissions, error: submissionsError } = await supabase
      .from('community_submissions')
      .select('status')
      .eq('submitted_by', userId);

    if (submissionsError) {
      return NextResponse.json({ error: 'Failed to fetch submission stats', details: submissionsError.message }, { status: 500 });
    }

    const totalSubmissions = submissions?.length || 0;
    const approvedCount = submissions?.filter(s => s.status === 'approved').length || 0;
    const totalPoints = userPoints?.points || 0;

    return NextResponse.json({
      total_points: totalPoints,
      submissions_count: totalSubmissions,
      approved_count: approvedCount,
      rejected_count: submissions?.filter(s => s.status === 'rejected').length || 0,
      pending_count: submissions?.filter(s => s.status === 'pending').length || 0
    });
});
