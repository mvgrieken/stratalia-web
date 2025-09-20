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

    // Get translation feedback statistics
    const { data: feedbackStats, error: feedbackError } = await supabase
      .from('ai_translation_feedback')
      .select('phrase, translation, upvotes, downvotes, last_feedback_at')
      .gte('last_feedback_at', startDate.toISOString())
      .order('upvotes', { ascending: false })
      .limit(limit);

    if (feedbackError) {
      logger.warn('Failed to fetch translation feedback:', feedbackError);
    }

    // Get user feedback statistics
    const { data: userFeedback, error: userError } = await supabase
      .from('user_translation_feedback')
      .select('feedback_type, created_at')
      .gte('created_at', startDate.toISOString());

    if (userError) {
      logger.warn('Failed to fetch user feedback:', userError);
    }

    // Calculate statistics
    const totalFeedback = userFeedback?.length || 0;
    const upvotes = userFeedback?.filter(f => f.feedback_type === 'upvote').length || 0;
    const downvotes = userFeedback?.filter(f => f.feedback_type === 'downvote').length || 0;
    const satisfactionRate = totalFeedback > 0 ? (upvotes / totalFeedback) * 100 : 0;

    // Get most problematic translations (high downvotes)
    const { data: problematicTranslations, error: problemError } = await supabase
      .from('ai_translation_feedback')
      .select('phrase, translation, upvotes, downvotes')
      .gte('downvotes', 1)
      .order('downvotes', { ascending: false })
      .limit(10);

    if (problemError) {
      logger.warn('Failed to fetch problematic translations:', problemError);
    }

    // Get most helpful translations (high upvotes)
    const { data: helpfulTranslations, error: helpfulError } = await supabase
      .from('ai_translation_feedback')
      .select('phrase, translation, upvotes, downvotes')
      .gte('upvotes', 1)
      .order('upvotes', { ascending: false })
      .limit(10);

    if (helpfulError) {
      logger.warn('Failed to fetch helpful translations:', helpfulError);
    }

    return NextResponse.json({
      timeframe,
      total_feedback: totalFeedback,
      upvotes,
      downvotes,
      satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
      feedback_stats: feedbackStats || [],
      problematic_translations: problematicTranslations || [],
      helpful_translations: helpfulTranslations || [],
      period: {
        start: startDate.toISOString(),
        end: now.toISOString()
      }
    });

  } catch (error) {
    logger.error('Translation analytics error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: 'Failed to fetch translation analytics' }, { status: 500 });
  }
});
