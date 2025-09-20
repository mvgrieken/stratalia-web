import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest) => {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = userData.user;
    const now = new Date();
    
    // Calculate session expiration (default 24 hours from last sign in)
    const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date(user.created_at);
    const sessionExpiresAt = new Date(lastSignIn.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Check if session is expiring soon (within 1 hour)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const isExpiringSoon = sessionExpiresAt <= oneHourFromNow;
    
    // Calculate session duration in hours
    const sessionDuration = Math.floor((now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60));
    
    const sessionInfo = {
      expires_at: sessionExpiresAt.toISOString(),
      last_activity: user.last_sign_in_at || user.created_at,
      session_duration: sessionDuration,
      is_expiring_soon: isExpiringSoon,
      user_id: user.id,
      email: user.email,
      email_confirmed: !!user.email_confirmed_at
    };

    return NextResponse.json(sessionInfo);
    
  } catch (error) {
    logger.error('Error fetching session info:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
