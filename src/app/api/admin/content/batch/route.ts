import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
// POST /api/admin/content/batch - Batch approve/reject content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status, reviewed_by } = body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({
        error: 'Ids array is required'
      }, { status: 400 });
    }
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        error: 'Status must be "approved" or "rejected"'
      }, { status: 400 });
    }
    logger.info(`🔄 Batch updating ${ids.length} content items to status: ${status}`);
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
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString()
    };
    if (reviewed_by) {
      updateData.reviewed_by = reviewed_by;
    }
    const { data: content, error } = await supabase
      .from('content_updates')
      .update(updateData)
      .in('id', ids)
      .select();
    if (error) {
      const normalized = normalizeError(error);
    logger.error(`❌ Error batch updating content: ${normalized}`);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    // Log de batch actie
    await supabase
      .from('import_log')
      .insert({
        type: 'batch_content_review',
        source: `batch_${ids.length}_items`,
        status: status
      });
    logger.info(`✅ Batch updated ${content?.length || 0} content items to ${status}`);
    return NextResponse.json({
      success: true,
      updated_count: content?.length || 0,
      items: content
    });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`💥 Error in batch content API: ${normalized}`);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
