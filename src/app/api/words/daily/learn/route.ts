import { NextRequest, NextResponse } from 'next/server';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

const schema = z.object({
  word_id: z.string().optional(),
  word: z.string().optional(),
  date: z.string().optional(),
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const POST = withApiError(withZod(schema, async (request: NextRequest) => {
    const { word_id, word, date } = await request.json();
    const supabaseServer = getServerSupabase(request);
    const { data: userData, error: userErr } = await supabaseServer.auth.getUser();
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const forDate = (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? date : today();

    const payload: any = {
      user_id: userData.user.id,
      date: forDate,
      completed: true,
    };
    if (word_id) payload.word_id = word_id;
    if (word) payload.word = word;

    const result: { progress_upserted?: boolean; user_updated?: boolean } = {};

    // Try to record daily progress (table may not exist; ignore errors)
    try {
      await supabase
        .from('user_daily_progress')
        .upsert(payload, { onConflict: 'user_id,date' });
      result.progress_upserted = true;
    } catch (_e) {
      logger.debug('user_daily_progress table missing; skipping upsert');
    }

    // Best-effort: touch users.updated_at; points/streak handled later via migrations
    try {
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userData.user.id);
      result.user_updated = true;
    } catch (_e) {
      // ignore
    }

    return NextResponse.json({ success: true, date: forDate, ...result });
}));


