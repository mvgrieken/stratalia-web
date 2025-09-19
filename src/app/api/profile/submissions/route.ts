import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const schema = z.object({
  limit: z.string().optional(),
  offset: z.string().optional(),
  status: z.string().optional(),
});

export const GET = withApiError(withZod(schema, async (_request: NextRequest) => {
    // Get current user from session
    const supabase = getSupabaseServiceClient();
    
    // Get session from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.info(`User ${session.user.email} fetching their submissions`);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'all';

    // Build query
    let query = supabase
      .from('community_submissions')
      .select('*', { count: 'exact' })
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error, count } = await query;

    if (error) {
      logger.error(`Error fetching user submissions: ${error instanceof Error ? error.message : String(error)}`);
      return NextResponse.json({ error: 'Failed to fetch submissions', details: error.message }, { status: 500 });
    }

    logger.info(`Found ${count} submissions for user ${userId}`);
    return NextResponse.json({ 
      submissions: submissions || [],
      total: count,
      limit,
      offset
    });
}));
