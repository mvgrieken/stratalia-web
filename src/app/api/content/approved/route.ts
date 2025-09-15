import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

// GET /api/content/approved - Haal alleen goedgekeurde content op voor de frontend
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    logger.info(`Fetching approved content, type: ${type}, limit: ${limit}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let query = supabase
      .from('content_updates')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: content, error } = await query;

    if (error) {
      logger.dbError('content_updates', 'SELECT', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    logger.performance('content-approved', duration);
    logger.info(`Found ${content?.length || 0} approved content items`);
    
    const response = NextResponse.json(content || []);
    
    // Cache for 10 minutes since approved content doesn't change often
    response.headers.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    return response;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.performance('content-approved-error', duration);
    logger.error('Error in approved content API', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
