import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const shareSchema = z.object({
  type: z.enum(['daily_word', 'word_detail', 'quiz_result', 'achievement']),
  word: z.string().optional(),
  method: z.enum(['web_share_api', 'clipboard', 'social_media']),
  platform: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export const POST = withApiError(withZod(shareSchema, async (request: NextRequest) => {
  const { type, word, method, platform } = await request.json();
  
  logger.info(`Share analytics: type=${type}, word=${word}, method=${method}, platform=${platform}`);

  try {
    const supabase = getSupabaseServiceClient();

    // Get user ID if available (optional for analytics)
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || null;

    // Insert share analytics record
    const { error } = await supabase
      .from('share_analytics')
      .insert({
        user_id: userId,
        type,
        word: word || null,
        method,
        platform: platform || null,
        user_agent: request.headers.get('user-agent') || 'unknown',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        created_at: new Date().toISOString()
      });

    if (error) {
      logger.warn(`Failed to log share analytics: ${error.message}`);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logger.error('Share analytics error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to log share analytics' }, { status: 500 });
  }
}));
