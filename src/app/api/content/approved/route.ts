import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/content/approved - Haal alleen goedgekeurde content op voor de frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log(`📋 Fetching approved content, type: ${type}, limit: ${limit}`);

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
      console.error('❌ Error fetching approved content:', error);
      return NextResponse.json({
        error: 'Database unavailable',
        details: error.message
      }, { status: 500 });
    }

    console.log(`✅ Found ${content?.length || 0} approved content items`);
    return NextResponse.json(content || []);

  } catch (error) {
    console.error('💥 Error in approved content API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
