import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';

export const dynamic = 'force-dynamic';

export const POST = withApiError(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = getSupabaseServiceClient();
  const knowledgeId = params.id;

  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    logger.warn('Unauthorized attempt to like knowledge item.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Check if user already liked this item
    const { data: existingLike, error: fetchError } = await supabase
      .from('knowledge_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('knowledge_id', knowledgeId)
      .single();

    let newLikeCount = 0;
    let result = 'no_change';

    if (existingLike) {
      // User already liked, remove the like
      const { error: deleteError } = await supabase
        .from('knowledge_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        logger.error(`Failed to remove like: ${deleteError.message}`);
        return NextResponse.json({ message: 'Failed to remove like' }, { status: 500 });
      }

      // Decrement like count
      const { data: updatedItem, error: updateError } = await supabase
        .from('knowledge_items')
        .update({
          like_count: Math.max((await supabase.from('knowledge_items').select('like_count').eq('id', knowledgeId).single()).data?.like_count || 0, 1) - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', knowledgeId)
        .select('like_count')
        .single();

      if (updateError) {
        logger.error(`Failed to update like count: ${updateError.message}`);
      } else {
        newLikeCount = updatedItem?.like_count || 0;
      }

      result = 'removed';
    } else {
      // User hasn't liked yet, add the like
      const { error: insertError } = await supabase
        .from('knowledge_likes')
        .insert({
          user_id: userId,
          knowledge_id: knowledgeId,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        logger.error(`Failed to add like: ${insertError.message}`);
        return NextResponse.json({ message: 'Failed to add like' }, { status: 500 });
      }

      // Increment like count
      const { data: updatedItem, error: updateError } = await supabase
        .from('knowledge_items')
        .update({
          like_count: (await supabase.from('knowledge_items').select('like_count').eq('id', knowledgeId).single()).data?.like_count || 0 + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', knowledgeId)
        .select('like_count')
        .single();

      if (updateError) {
        logger.error(`Failed to update like count: ${updateError.message}`);
      } else {
        newLikeCount = updatedItem?.like_count || 0;
      }

      result = 'added';
    }

    logger.info(`Knowledge item like updated: userId=${userId}, knowledgeId=${knowledgeId}, result=${result}`);

    return NextResponse.json({
      success: true,
      result,
      knowledge_id: knowledgeId,
      new_like_count: newLikeCount,
      user_liked: result === 'added'
    });

  } catch (error) {
    logger.error('Knowledge item like error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
