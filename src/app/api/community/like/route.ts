import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const likeSchema = z.object({
  submission_id: z.string().uuid(),
  action: z.enum(['like', 'unlike']),
});

export const POST = withApiError(withZod(likeSchema, async (request: NextRequest, validatedData: any) => {
  const { submission_id, action } = validatedData;
  
  try {
    const supabase = getSupabaseServiceClient();
    
    // For now, we'll use a placeholder user ID since we don't have authentication fully set up
    // In a real app, you'd get this from the authenticated session
    const userId = request.headers.get('x-user-id') || 'anonymous-user';
    
    logger.info(`👍 Community like action: ${action} on submission ${submission_id} by user ${userId}`);
    
    if (action === 'like') {
      // Check if user already liked this submission
      const { data: existingLike, error: checkError } = await supabase
        .from('user_submission_likes')
        .select('id')
        .eq('submission_id', submission_id)
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        logger.error(`Error checking existing like: ${checkError.message}`);
        return NextResponse.json({
          error: 'Database error',
          details: checkError.message
        }, { status: 500 });
      }
      
      if (existingLike) {
        return NextResponse.json({
          error: 'Already liked',
          message: 'Je hebt deze inzending al geliked'
        }, { status: 400 });
      }
      
      // Add the like
      const { data: likeData, error: likeError } = await supabase
        .from('user_submission_likes')
        .insert({
          submission_id,
          user_id: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (likeError) {
        logger.error(`Error adding like: ${likeError.message}`);
        return NextResponse.json({
          error: 'Database error',
          details: likeError.message
        }, { status: 500 });
      }
      
      // Update the submission's like count
      const { error: updateError } = await supabase.rpc('increment_submission_likes', {
        submission_id
      });
      
      if (updateError) {
        logger.warn(`Error updating like count: ${updateError.message}`);
        // Don't fail the request if the count update fails
      }
      
      logger.info(`✅ Like added successfully: ${likeData.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Inzending geliked!',
        like_id: likeData.id,
        action: 'liked'
      });
      
    } else if (action === 'unlike') {
      // Remove the like
      const { error: unlikeError } = await supabase
        .from('user_submission_likes')
        .delete()
        .eq('submission_id', submission_id)
        .eq('user_id', userId);
      
      if (unlikeError) {
        logger.error(`Error removing like: ${unlikeError.message}`);
        return NextResponse.json({
          error: 'Database error',
          details: unlikeError.message
        }, { status: 500 });
      }
      
      // Update the submission's like count
      const { error: updateError } = await supabase.rpc('decrement_submission_likes', {
        submission_id
      });
      
      if (updateError) {
        logger.warn(`Error updating like count: ${updateError.message}`);
        // Don't fail the request if the count update fails
      }
      
      logger.info(`✅ Like removed successfully for submission ${submission_id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Like verwijderd',
        action: 'unliked'
      });
    }
    
    return NextResponse.json({
      error: 'Invalid action',
      details: 'Action must be "like" or "unlike"'
    }, { status: 400 });
    
  } catch (error) {
    logger.error('Error in community like API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}));

// GET endpoint to check if user has liked a submission
export const GET = withApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submission_id');
  
  if (!submissionId) {
    return NextResponse.json({
      error: 'Missing submission_id parameter'
    }, { status: 400 });
  }
  
  try {
    const supabase = getSupabaseServiceClient();
    
    // For now, we'll use a placeholder user ID
    const userId = request.headers.get('x-user-id') || 'anonymous-user';
    
    // Check if user has liked this submission
    const { data: likeData, error } = await supabase
      .from('user_submission_likes')
      .select('id, created_at')
      .eq('submission_id', submissionId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      logger.error(`Error checking like status: ${error.message}`);
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      has_liked: !!likeData,
      like_data: likeData || null
    });
    
  } catch (error) {
    logger.error('Error in community like status API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
});