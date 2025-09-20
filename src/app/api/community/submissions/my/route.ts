import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const GET = withApiError(async (request: NextRequest) => {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get user from session (for now, we'll use a placeholder)
    // In a real app, you'd get this from the authenticated session
    const userId = request.headers.get('x-user-id') || null;
    
    logger.info(`📝 Fetching user submissions for user: ${userId || 'anonymous'}`);
    
    // Build query for user's submissions
    let query = supabase
      .from('community_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Filter by user if authenticated
    if (userId) {
      query = query.eq('submitted_by', userId);
    } else {
      // For anonymous users, we can't filter by user
      // This is a limitation of the current system
      query = query.is('submitted_by', null);
    }
    
    const { data: submissions, error } = await query;
    
    if (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`❌ Error fetching user submissions: ${msg}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: msg
      }, { status: 500 });
    }
    
    // Calculate statistics
    const stats = {
      total: submissions?.length || 0,
      pending: submissions?.filter(s => s.status === 'pending').length || 0,
      approved: submissions?.filter(s => s.status === 'approved').length || 0,
      rejected: submissions?.filter(s => s.status === 'rejected').length || 0,
    };
    
    logger.info(`✅ Found ${submissions?.length || 0} user submissions`);
    
    return NextResponse.json({
      submissions: submissions || [],
      stats
    });
    
  } catch (error) {
    logger.error('Error in user submissions API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});