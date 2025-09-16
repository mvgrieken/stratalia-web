import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
// PUT /api/admin/content/[id] - Update content status (approve/reject)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reviewed_by } = body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({
        error: 'Status must be "approved" or "rejected"'
      }, { status: 400 });
    }
    logger.info(`🔄 Updating content ${id} to status: ${status}`);
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
      .eq('id', id)
      .select()
      .single();
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error updating content:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    if (!content) {
      return NextResponse.json({
        error: 'Content not found'
      }, { status: 404 });
    }
    // Log de actie
    await supabase
      .from('import_log')
      .insert({
        type: 'content_review',
        source: `content_${id}`,
        status: status
      });
    logger.info(`✅ Content ${id} updated to ${status}`);
    return NextResponse.json(content);
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in content update API', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
// DELETE /api/admin/content/[id] - Verwijder content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logger.info(`🗑️ Deleting content ${id}`);
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
    const { error } = await supabase
      .from('content_updates')
      .delete()
      .eq('id', id);
    if (error) {
      const normalized = normalizeError(error);
    logger.error('❌ Error deleting content:', normalized);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }
    logger.info(`✅ Content ${id} deleted`);
    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error('💥 Error in content delete API', normalized);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
