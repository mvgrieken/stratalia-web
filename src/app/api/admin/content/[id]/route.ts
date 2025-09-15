import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    console.log(`🔄 Updating content ${id} to status: ${status}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables are missing!');
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
      console.error('❌ Error updating content:', error);
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

    console.log(`✅ Content ${id} updated to ${status}`);
    return NextResponse.json(content);

  } catch (error) {
    console.error('💥 Error in content update API:', error);
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

    console.log(`🗑️ Deleting content ${id}`);

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase environment variables are missing!');
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
      console.error('❌ Error deleting content:', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Content ${id} deleted`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('💥 Error in content delete API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
