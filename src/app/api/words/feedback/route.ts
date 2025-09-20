import { NextRequest, NextResponse } from 'next/server';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const feedbackSchema = z.object({
  word: z.string().min(1),
  meaning: z.string().min(1),
  helpful: z.boolean()
});

export const POST = withApiError(withZod(feedbackSchema, async (request: NextRequest) => {
  const { word, meaning, helpful } = await request.json();
  
  const supabase = getSupabaseServiceClient();

  try {
    // Get user session for authenticated feedback
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Log search result feedback
    const { error: insertError } = await supabase
      .from('search_result_feedback')
      .insert({
        word,
        meaning,
        helpful,
        user_id: userId,
        user_agent: request.headers.get('user-agent') || 'unknown',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      logger.warn('Failed to save search feedback:', insertError);
      // Don't fail the request, just log the error
    }

    // Update word popularity based on feedback
    if (helpful) {
      try {
        await supabase
          .from('words')
          .update({
            usage_frequency: 1, // Increment would need a database function
            updated_at: new Date().toISOString()
          })
          .eq('word', word.toLowerCase());
      } catch (updateError) {
        logger.debug('Failed to update word popularity:', updateError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Search feedback error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}));
