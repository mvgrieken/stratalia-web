import { NextRequest, NextResponse } from 'next/server';
import { withApiError } from '@/lib/api-wrapper';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export const GET = withApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d

  const supabase = getSupabaseServiceClient();

  try {
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get popular search queries
    const { data: popularQueries, error: queriesError } = await supabase
      .from('search_queries')
      .select('query, result_count')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (queriesError) {
      logger.warn(`Failed to fetch search analytics: ${queriesError instanceof Error ? queriesError.message : String(queriesError)}`);
    }

    // Get search statistics
    const { data: searchStats, error: statsError } = await supabase
      .from('search_queries')
      .select('result_count')
      .gte('created_at', startDate.toISOString());

    if (statsError) {
      logger.warn(`Failed to fetch search statistics: ${statsError instanceof Error ? statsError.message : String(statsError)}`);
    }

    // Calculate statistics
    const totalSearches = searchStats?.length || 0;
    const avgResultsPerSearch = searchStats?.length > 0 
      ? searchStats.reduce((sum, stat) => sum + (stat.result_count || 0), 0) / searchStats.length 
      : 0;
    const zeroResultSearches = searchStats?.filter(stat => (stat.result_count || 0) === 0).length || 0;

    // Get most searched words from words table
    const { data: popularWords, error: wordsError } = await supabase
      .from('words')
      .select('word, usage_frequency')
      .eq('is_active', true)
      .order('usage_frequency', { ascending: false })
      .limit(10);

    if (wordsError) {
      logger.warn(`Failed to fetch popular words: ${wordsError instanceof Error ? wordsError.message : String(wordsError)}`);
    }

    return NextResponse.json({
      timeframe,
      total_searches: totalSearches,
      avg_results_per_search: Math.round(avgResultsPerSearch * 100) / 100,
      zero_result_searches: zeroResultSearches,
      popular_queries: popularQueries || [],
      popular_words: popularWords || [],
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });

  } catch (error) {
    logger.error('Search analytics error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Failed to fetch search analytics' }, { status: 500 });
  }
});
