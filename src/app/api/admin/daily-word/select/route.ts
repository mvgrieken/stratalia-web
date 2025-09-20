import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const POST = withApiError(async (request: NextRequest) => {
  try {
    logger.info('Manual daily word selection triggered');

    const supabase = getSupabaseServiceClient();

    // Call the select_daily_word function
    const { data, error } = await supabase.rpc('select_daily_word');
    
    if (error) {
      logger.error('Error selecting daily word:', error);
      return NextResponse.json({ 
        error: 'Failed to select daily word', 
        details: error.message 
      }, { status: 500 });
    }

    // Get today's word to return
    const { data: todaysWord, error: wordError } = await supabase.rpc('get_todays_word');
    
    if (wordError) {
      logger.error('Error getting today\'s word:', wordError);
      return NextResponse.json({ 
        error: 'Failed to get today\'s word', 
        details: wordError.message 
      }, { status: 500 });
    }

    logger.info('Daily word selection completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Daily word selected successfully',
      word: todaysWord[0] || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Daily word selection error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});
