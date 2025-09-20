import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const POST = withApiError(async (request: NextRequest) => {
  try {
    const supabase = getSupabaseServiceClient();
    
    // Get authenticated user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = userData.user;
    
    // Update last activity timestamp
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      last_sign_in_at: new Date().toISOString()
    });
    
    if (updateError) {
      logger.error(`Failed to extend session: ${updateError.message}`);
      return NextResponse.json({ 
        error: 'Kon sessie niet verlengen' 
      }, { status: 500 });
    }
    
    logger.info(`Session extended for user: ${user.email}`);
    
    return NextResponse.json({
      success: true,
      message: 'Sessie verlengd',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    });
    
  } catch (error) {
    logger.error('Error extending session:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
