import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
// removed unused normalizeError import
import { applyRateLimit } from '@/middleware/rateLimiter';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const feedbackSchema = z.object({
  phrase: z.string().min(1),
  translation: z.string().min(1),
  upvote: z.boolean().optional(),
  downvote: z.boolean().optional(),
});

export const POST = withApiError(withZod(feedbackSchema, async (request: NextRequest) => {
    const rate = applyRateLimit(request, 'community');
    if (!rate.allowed) return rate.response!;

    const { phrase, translation, upvote, downvote } = await request.json();
    if (!phrase || !translation) {
      return NextResponse.json({ error: 'phrase en translation zijn verplicht' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Database configuratie ontbreekt' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user session for authenticated feedback
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Upsert feedback: increment upvotes/downvotes for the same pair
    const { data: existing, error: findError } = await supabase
      .from('ai_translation_feedback')
      .select('*')
      .eq('phrase', phrase)
      .eq('translation', translation)
      .single();

    if (findError && (findError as any).code !== 'PGRST116') {
      logger.warn(`Feedback lookup failed: ${findError instanceof Error ? findError.message : String(findError)}`);
    }

    const upvotes = (existing?.upvotes || 0) + (upvote ? 1 : 0);
    const downvotes = (existing?.downvotes || 0) + (downvote ? 1 : 0);

    const { error: upsertError } = await supabase
      .from('ai_translation_feedback')
      .upsert({ 
        phrase, 
        translation, 
        upvotes, 
        downvotes,
        user_id: userId,
        last_feedback_at: new Date().toISOString()
      })
      .select()
      .single();

    // Log individual feedback for user analytics
    if (userId && (upvote || downvote)) {
      try {
        await supabase
          .from('user_translation_feedback')
          .insert({
            user_id: userId,
            phrase,
            translation,
            feedback_type: upvote ? 'upvote' : 'downvote',
            created_at: new Date().toISOString()
          });
      } catch (logError) {
        logger.debug(`Failed to log user feedback: ${logError instanceof Error ? logError.message : String(logError)}`);
      }
    }

    if (upsertError) {
      logger.error(`Feedback save error: ${upsertError instanceof Error ? upsertError.message : String(upsertError)}`);
      return NextResponse.json({ error: 'Opslaan van feedback mislukt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}));
