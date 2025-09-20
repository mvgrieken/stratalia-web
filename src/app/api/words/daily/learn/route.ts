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

    // Update user points and streak
    try {
      const { data: user, error: userErr } = await supabase
        .from('users')
        .select('points, current_streak, last_learned_date')
        .eq('id', userData.user.id)
        .single();

      if (!userErr && user) {
        const today = new Date().toISOString().slice(0, 10);
        const lastLearned = user.last_learned_date;
        const isConsecutive = lastLearned === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        
        const newStreak = isConsecutive ? (user.current_streak || 0) + 1 : 1;
        const pointsEarned = Math.min(10 + (newStreak - 1) * 2, 50); // 10 base + 2 per streak, max 50
        const newPoints = (user.points || 0) + pointsEarned;

        await supabase
          .from('users')
          .update({ 
            points: newPoints,
            current_streak: newStreak,
            last_learned_date: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', userData.user.id);

        result.points_earned = pointsEarned;
        result.new_total_points = newPoints;
        result.new_streak = newStreak;
        result.user_updated = true;

        // Queue notification for daily word completion
        try {
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications/daily-word`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userData.user.id,
              word: word || 'Woord van de dag',
              meaning: 'Gefeliciteerd! Je hebt het woord van de dag geleerd.',
              date: forDate
            })
          });
        } catch (_e) {
          // Notification is best-effort, don't fail the main flow
        }
      }
    } catch (_e) {
      logger.warn('Failed to update user points/streak:', _e);
    }

    return NextResponse.json({ success: true, date: forDate, ...result });
}));


