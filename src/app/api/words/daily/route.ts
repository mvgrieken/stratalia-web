import { NextRequest, NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';
import { cacheService, CACHE_TTL } from '@/lib/cache-service';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/config';
import { logger } from '@/lib/logger';

type DailyWord = {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  date: string;
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (_request: NextRequest) => {
  const dateStr = todayKey();
  const cacheKey = `daily_word:${dateStr}`;

  const cached = cacheService.get<DailyWord>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Try Supabase-backed persistence
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseServiceClient();

      // 1) Try to read persisted word from word_of_day table (if exists)
      const { data: persisted, error: persistedErr } = await supabase
        .from('word_of_day')
        .select('id, word, meaning, example, date')
        .eq('date', dateStr)
        .limit(1)
        .maybeSingle();

      if (!persistedErr && persisted) {
        const daily: DailyWord = {
          id: persisted.id,
          word: persisted.word,
          meaning: persisted.meaning,
          example: persisted.example,
          date: persisted.date,
        };
        cacheService.set(cacheKey, daily, CACHE_TTL.SHORT);
        return NextResponse.json(daily, { headers: { 'Cache-Control': 'no-store' } });
      }

      // 2) Pick a random active word from words table
      // Note: random() requires a Postgres function; alternatively order by id and offset
      const { data: candidate, error: pickErr } = await supabase
        .from('words')
        .select('id, word, meaning, example')
        .eq('is_active', true)
        .order('usage_frequency', { ascending: false })
        .limit(100);

      if (!pickErr && candidate && candidate.length > 0) {
        const randomIdx = Math.floor(Math.random() * candidate.length);
        const chosen = candidate[randomIdx];
        const daily: DailyWord = {
          id: String(chosen.id),
          word: chosen.word,
          meaning: chosen.meaning || '',
          example: chosen.example || null,
          date: dateStr,
        };

        // 3) Try to persist to word_of_day (ignore if table missing)
        try {
          await supabase
            .from('word_of_day')
            .upsert({ id: daily.id, word: daily.word, meaning: daily.meaning, example: daily.example, date: daily.date }, { onConflict: 'date' });
        } catch (_e) {
          // ignore if table doesn't exist
        }

        cacheService.set(cacheKey, daily, CACHE_TTL.SHORT);
        return NextResponse.json(daily, { headers: { 'Cache-Control': 'no-store' } });
      }

      logger.warn('No active words found; falling back to emergency word');
    } catch (e: any) {
      logger.warn(`Daily word Supabase flow failed: ${e?.message || e}`);
    }
  }

  // Fallback emergency word to keep page functional
  const fallback: DailyWord = {
    id: 'fallback-emergency',
    word: 'skeer',
    meaning: 'arm, weinig geld hebben',
    example: 'Ik ben helemaal skeer deze maand.',
    date: dateStr,
  };
  cacheService.set(cacheKey, fallback, CACHE_TTL.SHORT);
  return NextResponse.json(fallback, { headers: { 'Cache-Control': 'no-store' } });
});