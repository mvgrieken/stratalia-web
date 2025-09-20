import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
  try {
    // Verify this is a cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Daily word cron job triggered');

    // Get Supabase project URL and service key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Missing Supabase configuration for cron job');
      return NextResponse.json({ error: 'Configuration missing' }, { status: 500 });
    }

    // Call the Supabase edge function
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/daily-word-selector`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`Edge function call failed: ${response.status} ${errorText}`);
      return NextResponse.json({ 
        error: 'Edge function call failed', 
        details: errorText 
      }, { status: 500 });
    }

    const result = await response.json();
    logger.info('Daily word selection completed:', result);

    return NextResponse.json({
      success: true,
      message: 'Daily word selection completed',
      result
    });

  } catch (error) {
    logger.error('Cron job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};
