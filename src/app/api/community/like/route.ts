import { NextRequest, NextResponse } from 'next/server';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const likeSchema = z.object({
  submission_id: z.string().min(1),
  action: z.enum(['like', 'unlike', 'dislike', 'undislike'])
});

export const POST = withApiError(withZod(likeSchema, async (request: NextRequest) => {
  const { submission_id, action } = await request.json();
  
  const supabase = getSupabaseServiceClient();

  try {
    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = user.id;

    // Check if user has already liked/disliked this submission
    const { data: existingLike, error: fetchError } = await supabase
      .from('community_submission_likes')
      .select('*')
      .eq('submission_id', submission_id)
      .eq('user_id', userId)
      .single();

    if (fetchError && (fetchError as any).code !== 'PGRST116') {
      logger.warn('Failed to fetch existing like:', fetchError);
    }

    let result;
    
    if (existingLike) {
      // Update existing like/dislike
      if (action === 'unlike' || action === 'undislike') {
        // Remove the like/dislike
        const { error: deleteError } = await supabase
          .from('community_submission_likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) {
          logger.error('Failed to remove like:', deleteError);
          return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
        }
        
        result = { action: 'removed', previous_action: existingLike.action };
      } else {
        // Update the action
        const { error: updateError } = await supabase
          .from('community_submission_likes')
          .update({ 
            action: action === 'like' ? 'like' : 'dislike',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLike.id);

        if (updateError) {
          logger.error('Failed to update like:', updateError);
          return NextResponse.json({ error: 'Failed to update like' }, { status: 500 });
        }
        
        result = { action: 'updated', previous_action: existingLike.action };
      }
    } else {
      // Create new like/dislike
      if (action === 'like' || action === 'dislike') {
        const { error: insertError } = await supabase
          .from('community_submission_likes')
          .insert({
            submission_id,
            user_id: userId,
            action: action === 'like' ? 'like' : 'dislike',
            created_at: new Date().toISOString()
          });

        if (insertError) {
          logger.error('Failed to create like:', insertError);
          return NextResponse.json({ error: 'Failed to create like' }, { status: 500 });
        }
        
        result = { action: 'created' };
      } else {
        return NextResponse.json({ error: 'Cannot unlike/dislike without existing like' }, { status: 400 });
      }
    }

    // Update submission like counts
    const { data: likeCounts, error: countError } = await supabase
      .from('community_submission_likes')
      .select('action')
      .eq('submission_id', submission_id);

    if (!countError && likeCounts) {
      const likes = likeCounts.filter(l => l.action === 'like').length;
      const dislikes = likeCounts.filter(l => l.action === 'dislike').length;

      await supabase
        .from('community_submissions')
        .update({
          like_count: likes,
          dislike_count: dislikes,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission_id);
    }

    return NextResponse.json({ 
      success: true, 
      result,
      submission_id 
    });

  } catch (error) {
    logger.error('Like action error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}));
