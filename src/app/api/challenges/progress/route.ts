import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const progressUpdateSchema = z.object({
  challengeId: z.string().uuid(),
  progress: z.number().min(0),
  completed: z.boolean().optional()
});

export const dynamic = 'force-dynamic';

export const POST = withApiError(withZod(progressUpdateSchema, async (request: NextRequest) => {
  const { challengeId, progress, completed } = await request.json();
  const supabase = getSupabaseServiceClient();

  // Get authenticated user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    logger.warn('Unauthorized attempt to update challenge progress.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('target_value, points_reward, is_active')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      logger.error(`Challenge not found: ${challengeId}`);
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    if (!challenge.is_active) {
      return NextResponse.json({ message: 'Challenge is not active' }, { status: 400 });
    }

    // Check if user already has progress for this challenge
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_challenge_progress')
      .select('id, current_progress, is_completed, points_earned')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();

    const isCompleted = completed || progress >= challenge.target_value;
    const pointsEarned = isCompleted && !existingProgress?.is_completed ? challenge.points_reward : 0;

    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('user_challenge_progress')
        .update({
          current_progress: Math.max(existingProgress.current_progress, progress),
          is_completed: isCompleted,
          completed_at: isCompleted && !existingProgress.is_completed ? new Date().toISOString() : existingProgress.completed_at,
          points_earned: existingProgress.points_earned + pointsEarned,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) {
        logger.error(`Failed to update challenge progress: ${updateError.message}`);
        return NextResponse.json({ message: 'Failed to update progress' }, { status: 500 });
      }

      // Award points if challenge was just completed
      if (pointsEarned > 0) {
        const { error: pointsError } = await supabase
          .from('user_points')
          .upsert({
            user_id: userId,
            points: pointsEarned,
            level: 1 // This would need to be calculated based on total points
          }, {
            onConflict: 'user_id'
          });

        if (pointsError) {
          logger.warn(`Failed to award points: ${pointsError.message}`);
        }
      }

      logger.info(`Challenge progress updated: userId=${userId}, challengeId=${challengeId}, progress=${progress}, completed=${isCompleted}`);

      return NextResponse.json({
        success: true,
        progress: updatedProgress,
        points_earned: pointsEarned,
        message: isCompleted ? 'Challenge completed!' : 'Progress updated'
      });

    } else {
      // Create new progress record
      const { data: newProgress, error: insertError } = await supabase
        .from('user_challenge_progress')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          current_progress: progress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          points_earned: pointsEarned
        })
        .select()
        .single();

      if (insertError) {
        logger.error(`Failed to create challenge progress: ${insertError.message}`);
        return NextResponse.json({ message: 'Failed to create progress' }, { status: 500 });
      }

      // Award points if challenge was completed
      if (pointsEarned > 0) {
        const { error: pointsError } = await supabase
          .from('user_points')
          .upsert({
            user_id: userId,
            points: pointsEarned,
            level: 1
          }, {
            onConflict: 'user_id'
          });

        if (pointsError) {
          logger.warn(`Failed to award points: ${pointsError.message}`);
        }
      }

      logger.info(`Challenge progress created: userId=${userId}, challengeId=${challengeId}, progress=${progress}, completed=${isCompleted}`);

      return NextResponse.json({
        success: true,
        progress: newProgress,
        points_earned: pointsEarned,
        message: isCompleted ? 'Challenge completed!' : 'Progress created'
      });
    }

  } catch (error) {
    logger.error('Challenge progress update error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}));
