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

      // Use the get_todays_word function which automatically selects a word if none exists
      const { data: todaysWord, error: wordError } = await supabase.rpc('get_todays_word');

      if (!wordError && todaysWord && todaysWord.length > 0) {
        const word = todaysWord[0];
        const daily: DailyWord = {
          id: word.id,
          word: word.word,
          meaning: word.meaning,
          example: word.example,
          date: word.date,
        };
        cacheService.set(cacheKey, daily, CACHE_TTL.SHORT);
        return NextResponse.json(daily, { headers: { 'Cache-Control': 'no-store' } });
      }

      logger.warn('No word found for today; falling back to emergency word');
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