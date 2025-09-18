import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';

// GET /api/admin/content-proposals - Haal alle content proposals op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    logger.info(`📋 Fetching content proposals with status: ${status}, type: ${type}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('content_proposals')
      .select(`
        *,
        contributor:contributor_id (
          id,
          name,
          email
        ),
        reviewer:reviewed_by (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('proposal_type', type);
    }

    const { data: proposals, error } = await query;

    if (error) {
      const normalized = normalizeError(error);
      logger.error('❌ Error fetching content proposals:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    logger.info(`✅ Found ${proposals?.length || 0} content proposals`);

    return NextResponse.json({
      proposals: proposals || [],
      total: proposals?.length || 0
    });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in content proposals API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/admin/content-proposals - Voeg nieuwe content proposal toe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposal_type, proposed_data, source_type, contributor_id, contributor_name, priority_score } = body;

    if (!proposal_type || !proposed_data || !source_type) {
      return NextResponse.json({
        error: 'proposal_type, proposed_data, and source_type are required'
      }, { status: 400 });
    }

    logger.info(`📝 Adding new content proposal: ${proposal_type} - ${source_type}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: proposal, error } = await supabase
      .from('content_proposals')
      .insert({
        proposal_type,
        proposed_data,
        source_type,
        contributor_id,
        contributor_name,
        priority_score: priority_score || 0,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      const normalized = normalizeError(error);
      logger.error('❌ Error adding content proposal:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    logger.info(`✅ Content proposal added with ID: ${proposal.id}`);
    return NextResponse.json(proposal, { status: 201 });

  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in content proposals POST API:', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
