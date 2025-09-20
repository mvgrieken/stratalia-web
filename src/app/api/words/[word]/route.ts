import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { withApiError } from '@/lib/api-wrapper';
import { isSupabaseConfigured } from '@/lib/config';

export const dynamic = 'force-dynamic';

export const GET = withApiError(async (request: NextRequest, { params }: { params: { word: string } }) => {
  const { word } = params;
  
  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  logger.info(`Fetching word details for: ${word}`);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const supabase = getSupabaseServiceClient();
    const normalizedWord = word.toLowerCase().trim();

    // Fetch the specific word (get the first match if multiple exist)
    const { data: wordData, error: wordError } = await supabase
      .from('words')
      .select('*')
      .eq('word', normalizedWord)
      .eq('is_active', true)
      .order('usage_frequency', { ascending: false })
      .limit(1)
      .single();

    if (wordError) {
      logger.warn(`Word not found: ${wordError.message}`);
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    // Fetch similar words (same category or similar meaning)
    const { data: similarWords, error: similarError } = await supabase
      .from('words')
      .select('id, word, meaning, example, category, difficulty')
      .eq('is_active', true)
      .neq('id', wordData.id)
      .or(`category.eq.${wordData.category},meaning.ilike.%${normalizedWord}%`)
      .limit(5);

    if (similarError) {
      logger.warn(`Failed to fetch similar words: ${similarError.message}`);
    }

    // Fetch word usage statistics
    const { data: usageStats, error: statsError } = await supabase
      .from('search_queries')
      .select('result_count')
      .eq('query', normalizedWord);

    if (statsError) {
      logger.warn(`Failed to fetch usage stats: ${statsError.message}`);
    }

    const totalSearches = usageStats?.length || 0;
    const avgResults = usageStats && usageStats.length > 0
      ? usageStats.reduce((sum, stat) => sum + (stat.result_count || 0), 0) / usageStats.length
      : 0;

    const response = {
      word: wordData,
      similar_words: similarWords || [],
      usage_stats: {
        total_searches: totalSearches,
        avg_results_per_search: Math.round(avgResults * 100) / 100,
        popularity_score: wordData.usage_frequency || 0
      }
    };

    logger.info(`Word details retrieved successfully for: ${word}`);
    return NextResponse.json(response);

  } catch (error) {
    logger.error(`Error fetching word details: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
