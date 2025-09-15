import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      logger.error('Health check failed: Missing environment variables');
      return NextResponse.json({
        status: 'error',
        message: 'Missing environment variables',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Test database connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase
      .from('words')
      .select('count')
      .limit(1);

    if (error) {
      logger.error('Health check failed: Database connection error', error);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const duration = Date.now() - startTime;
    logger.performance('health-check', duration);

    // Return healthy status
    return NextResponse.json({
      status: 'ok',
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      checks: {
        database: 'ok',
        environment: 'ok'
      },
      responseTime: `${duration}ms`
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Health check failed: Unexpected error', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: `${duration}ms`
    }, { status: 503 });
  }
}
