import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
// GET /api/admin/content - Haal alle content updates op
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    logger.info(`📋 Fetching content updates with status: ${status}, type: ${type}`);
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    let query = supabase
      .from('content_updates')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (type) {
      query = query.eq('type', type);
    }
    const { data: content, error } = await query;
    if (error) {
      const normalized = normalizeError(error);
    logger.error(`❌ Error fetching content updates: ${normalized}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    logger.info(`✅ Found ${content?.length || 0} content updates`);
    return NextResponse.json(content || []);
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`💥 Error in content API: ${normalized}`);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// POST /api/admin/content - Voeg nieuwe content toe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, url } = body;
    if (!type || !title) {
      return NextResponse.json({
        error: 'Type and title are required'
      }, { status: 400 });
    }
    logger.info(`📝 Adding new content: ${type} - ${title}`);
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      logger.error('❌ Supabase environment variables are missing!');
      return NextResponse.json({
        error: 'Database configuration missing'
      }, { status: 500 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: content, error } = await supabase
      .from('content_updates')
      .insert({
        type,
        title,
        description,
        url,
        status: 'pending'
      })
      .select()
      .single();
    if (error) {
      const normalized = normalizeError(error);
    logger.error(`❌ Error adding content: ${normalized}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    logger.info(`✅ Content added with ID: ${content.id}`);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`💥 Error in content POST API: ${normalized}`);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
