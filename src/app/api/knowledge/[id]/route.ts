import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseServiceClient();
  const knowledgeId = params.id;

  try {
    // Get the knowledge item
    const { data: item, error: itemError } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', knowledgeId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      logger.warn(`Knowledge item not found: ${knowledgeId}`);
      return NextResponse.json({ message: 'Knowledge item not found' }, { status: 404 });
    }

    // Increment view count (fire and forget)
    supabase
      .from('knowledge_items')
      .update({ 
        view_count: (item.view_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', knowledgeId)
      .then(({ error }) => {
        if (error) {
          logger.warn(`Failed to increment view count: ${error.message}`);
        }
      });

    // Get related items (same category, excluding current item)
    const { data: relatedItems, error: relatedError } = await supabase
      .from('knowledge_items')
      .select('id, title, type, difficulty, thumbnail_url, created_at')
      .eq('category', item.category)
      .eq('is_active', true)
      .neq('id', knowledgeId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (relatedError) {
      logger.warn(`Failed to fetch related items: ${relatedError.message}`);
    }

    // Get user's like status if authenticated
    let userLiked = false;
    const { data: userData } = await supabase.auth.getUser();
    
    if (userData.user) {
      const { data: likeData } = await supabase
        .from('knowledge_likes')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('knowledge_id', knowledgeId)
        .single();
      
      userLiked = !!likeData;
    }

    logger.info(`Knowledge item fetched: id=${knowledgeId}, views=${(item.view_count || 0) + 1}`);

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        type: item.type,
        title: item.title,
        content: item.content,
        author: item.author,
        category: item.category,
        tags: item.tags || [],
        difficulty: item.difficulty,
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_active: item.is_active,
        thumbnail_url: item.thumbnail_url,
        video_url: item.video_url,
        audio_url: item.audio_url,
        duration: item.duration,
        word_count: item.word_count,
        view_count: (item.view_count || 0) + 1,
        like_count: item.like_count || 0,
        user_liked: userLiked
      },
      related_items: relatedItems || []
    });

  } catch (error) {
    logger.error('Knowledge item fetch error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
