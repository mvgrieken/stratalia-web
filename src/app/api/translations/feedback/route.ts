import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { applyRateLimit } from '@/middleware/rateLimiter';

export async function POST(request: NextRequest) {
  try {
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
      .upsert({ phrase, translation, upvotes, downvotes })
      .select()
      .single();

    if (upsertError) {
      logger.error(`Feedback save error: ${upsertError instanceof Error ? upsertError.message : String(upsertError)}`);
      return NextResponse.json({ error: 'Opslaan van feedback mislukt' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const normalized = normalizeError(error);
    logger.error(`Feedback API error: ${normalized}`);
    return NextResponse.json({ error: 'Onverwachte fout' }, { status: 500 });
  }
}
