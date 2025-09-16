import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: item, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Knowledge item not found' },
          { status: 404 }
        );
      }
      
      logger.error('Database error fetching knowledge item:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch knowledge item',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Get related items (same category or type)
    const { data: relatedItems } = await supabase
      .from('knowledge_items')
      .select('id, title, type, category, difficulty, thumbnail_url, duration, word_count')
      .eq('is_active', true)
      .neq('id', id)
      .or(`category.eq.${item.category},type.eq.${item.type}`)
      .order('created_at', { ascending: false })
      .limit(3);

    logger.info(`Fetched knowledge item: ${item.title}`, { id });

    return NextResponse.json({
      success: true,
      data: {
        item,
        relatedItems: relatedItems || []
      }
    });

  } catch (error) {
    logger.error('Error in knowledge item API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
