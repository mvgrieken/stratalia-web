import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { contentCrawler } from '@/lib/content-crawler';
import { canModerateContent } from '@/lib/auth-roles';
import type { UserRole } from '@/lib/auth-roles';

export async function POST(request: NextRequest) {
  try {
    // Check admin token for server-to-server calls (cron jobs)
    const adminToken = request.headers.get('x-admin-token');
    const authHeader = request.headers.get('authorization');
    
    let triggeredBy: string | undefined;
    let isAuthorized = false;

    // Check if this is a server-to-server call (cron job)
    if (adminToken === process.env.ADMIN_TOKEN) {
      isAuthorized = true;
      triggeredBy = 'system_cron';
    } 
    // Check if this is a user-triggered call
    else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
          error: 'Database configuratie ontbreekt'
        }, { status: 500 });
      }

      const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
      const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

      // Verify user
      const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
      
      if (userError || !userData.user) {
        return NextResponse.json({
          error: 'Ongeldige authenticatie'
        }, { status: 401 });
      }

      // Get user role
      const { data: profile, error: profileError } = await supabaseService
        .from('profiles')
        .select('role, full_name')
        .eq('id', userData.user.id)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({
          error: 'Gebruikersprofiel niet gevonden'
        }, { status: 404 });
      }

      // Check permissions
      if (!canModerateContent(profile.role as UserRole)) {
        return NextResponse.json({
          error: 'Onvoldoende rechten voor content crawling'
        }, { status: 403 });
      }

      isAuthorized = true;
      triggeredBy = userData.user.id;

      // Log admin action
      await supabaseService
        .from('admin_actions')
        .insert({
          admin_user_id: userData.user.id,
          action_type: 'manual_content_crawl',
          action_details: { 
            trigger_time: new Date().toISOString(),
            user_name: profile.full_name
          },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        });
    }

    if (!isAuthorized) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const { source_types, force_update } = body;

    logger.info(`Content crawl initiated by: ${triggeredBy}`);

    // Run the content crawler
    const results = await contentCrawler.runDailyCrawl(triggeredBy);

    logger.info(`Content crawl completed: ${results.newProposals} new proposals from ${results.successfulSources}/${results.totalSources} sources`);

    return NextResponse.json({
      message: 'Content crawl voltooid',
      results: {
        sources_processed: results.totalSources,
        sources_successful: results.successfulSources,
        items_found: results.totalItemsFound,
        new_proposals: results.newProposals,
        errors: results.errors
      },
      triggered_by: triggeredBy,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Content crawl API error:', normalized);
    
    return NextResponse.json({
      error: 'Er is een fout opgetreden bij het crawlen van content',
      details: normalized.message
    }, { status: 500 });
  }
}

// GET endpoint for crawl status and logs
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authenticatie vereist'
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Database configuratie ontbreekt'
      }, { status: 500 });
    }

    const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user and permissions
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    
    if (userError || !userData.user) {
      return NextResponse.json({
        error: 'Ongeldige authenticatie'
      }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !canModerateContent(profile.role as UserRole)) {
      return NextResponse.json({
        error: 'Onvoldoende rechten'
      }, { status: 403 });
    }

    // Get recent crawl logs
    const { data: logs, error: logsError } = await supabaseService
      .from('content_crawl_logs')
      .select(`
        id,
        crawl_type,
        started_at,
        completed_at,
        status,
        items_found,
        items_new,
        items_errors,
        execution_time_ms,
        content_sources(name)
      `)
      .order('started_at', { ascending: false })
      .limit(20);

    if (logsError) {
      throw new Error(`Failed to fetch crawl logs: ${logsError.message}`);
    }

    // Get content sources status
    const { data: sources, error: sourcesError } = await supabaseService
      .from('content_sources')
      .select('id, name, source_type, content_type, is_active, last_crawled_at, last_successful_crawl')
      .order('name');

    if (sourcesError) {
      throw new Error(`Failed to fetch content sources: ${sourcesError.message}`);
    }

    return NextResponse.json({
      crawl_logs: logs || [],
      content_sources: sources || [],
      summary: {
        total_sources: sources?.length || 0,
        active_sources: sources?.filter(s => s.is_active).length || 0,
        last_crawl: logs?.[0]?.started_at,
        pending_proposals: 0 // Would need separate query
      }
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('Crawl status API error:', normalized);
    
    return NextResponse.json({
      error: 'Er is een fout opgetreden bij het ophalen van crawl status'
    }, { status: 500 });
  }
}
