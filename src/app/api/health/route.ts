import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'your_supabase_project_url' || 
        supabaseAnonKey === 'your_supabase_anon_key') {
      logger.error('Health check failed: Missing or invalid environment variables');
      return NextResponse.json({
        status: 'error',
        message: 'Environment configuration missing',
        details: 'Supabase credentials not properly configured',
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`
      }, { status: 503 });
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (urlError) {
      logger.error('Health check failed: Invalid Supabase URL format', urlError);
      return NextResponse.json({
        status: 'error',
        message: 'Health check failed',
        details: `Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.`,
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`
      }, { status: 503 });
    }

    // Test database connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase
      .from('words')
      .select('count')
      .limit(1);

    if (error) {
      const normalized = normalizeError(error);
    logger.error('Health check failed: Database connection error', normalized);
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    const duration = Date.now() - startTime;
    logger.info(`Health check completed in ${duration}ms`);

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
    const normalized = normalizeError(error);
    logger.error('Health check failed: Unexpected error', normalized);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      responseTime: `${duration}ms`
    }, { status: 503 });
  }
}
