import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('knowledge_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    if (search) {
      // Use full-text search on title and content
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: items, error } = await query;

    if (error) {
      logger.error('Database error fetching knowledge items:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch knowledge items',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('knowledge_items')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (type) countQuery = countQuery.eq('type', type);
    if (category) countQuery = countQuery.eq('category', category);
    if (difficulty) countQuery = countQuery.eq('difficulty', difficulty);
    if (search) countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn('Failed to get count:', countError);
    }

    // Get statistics
    const { data: stats } = await supabase
      .from('knowledge_items')
      .select('type, category, difficulty')
      .eq('is_active', true);

    const statistics = {
      total: count || 0,
      byType: stats?.reduce((acc: any, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {}) || {},
      byCategory: stats?.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}) || {},
      byDifficulty: stats?.reduce((acc: any, item) => {
        acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
        return acc;
      }, {}) || {}
    };

    logger.info(`Fetched ${items?.length || 0} knowledge items`, {
      type, category, difficulty, search, limit, offset
    });

    return NextResponse.json({
      success: true,
      data: {
        items: items || [],
        pagination: {
          limit,
          offset,
          total: count || 0,
          hasMore: (count || 0) > offset + limit
        },
        statistics
      }
    });

  } catch (error) {
    logger.error('Error in knowledge items API:', error);
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