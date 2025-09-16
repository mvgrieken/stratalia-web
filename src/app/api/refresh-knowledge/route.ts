import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

// Mock external content sources
const EXTERNAL_SOURCES = {
  articles: [
    {
      title: 'Nieuwe Straattaal Trends 2024',
      content: 'De nieuwste trends in Nederlandse straattaal voor 2024. Ontdek welke woorden populair worden en hoe de taal evolueert.',
      category: 'trends',
      tags: ['trends', '2024', 'nieuw'],
      difficulty: 'intermediate',
      author: 'Stratalia Research Team',
      word_count: 300
    },
    {
      title: 'Straattaal in Gaming',
      content: 'Hoe gamers straattaal gebruiken in online games en streaming. Van Fortnite tot Twitch, straattaal is overal.',
      category: 'gaming',
      tags: ['gaming', 'streaming', 'online'],
      difficulty: 'beginner',
      author: 'Gaming Expert',
      word_count: 250
    }
  ],
  videos: [
    {
      title: 'Straattaal Tutorial: Basis Woorden',
      content: 'Leer de belangrijkste straattaalwoorden in deze interactieve video tutorial.',
      category: 'tutorial',
      tags: ['tutorial', 'basis', 'video'],
      difficulty: 'beginner',
      author: 'Stratalia Team',
      duration: 600,
      thumbnail_url: '/images/tutorial-thumb.jpg'
    }
  ],
  podcasts: [
    {
      title: 'Straattaal Podcast: Seizoen 2',
      content: 'Het tweede seizoen van onze populaire straattaal podcast met nieuwe gasten en onderwerpen.',
      category: 'podcast',
      tags: ['podcast', 'seizoen 2', 'nieuw'],
      difficulty: 'intermediate',
      author: 'Podcast Team',
      duration: 2400
    }
  ]
};

export async function POST(request: NextRequest) {
  try {
    // Check for cron secret or admin authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    const isCronRequest = cronSecret === process.env.CRON_SECRET;
    
    if (!isCronRequest && !authHeader) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // Optional: refresh specific type
    const force = searchParams.get('force') === 'true';

    const supabase = getSupabaseClient();
    let refreshCount = 0;
    const errors: string[] = [];

    logger.info('Starting knowledge refresh', { type, force });

    // Refresh articles
    if (!type || type === 'articles') {
      try {
        for (const article of EXTERNAL_SOURCES.articles) {
          const { error } = await supabase
            .from('knowledge_items')
            .upsert({
              title: article.title,
              type: 'article',
              content: article.content,
              category: article.category,
              tags: article.tags,
              difficulty: article.difficulty,
              author: article.author,
              word_count: article.word_count,
              source: 'external',
              is_active: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'title,type'
            });

          if (error) {
            errors.push(`Article "${article.title}": ${error.message}`);
          } else {
            refreshCount++;
          }
        }
      } catch (error) {
        errors.push(`Articles refresh failed: ${error}`);
      }
    }

    // Refresh videos
    if (!type || type === 'videos') {
      try {
        for (const video of EXTERNAL_SOURCES.videos) {
          const { error } = await supabase
            .from('knowledge_items')
            .upsert({
              title: video.title,
              type: 'video',
              content: video.content,
              category: video.category,
              tags: video.tags,
              difficulty: video.difficulty,
              author: video.author,
              duration: video.duration,
              thumbnail_url: video.thumbnail_url,
              source: 'external',
              is_active: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'title,type'
            });

          if (error) {
            errors.push(`Video "${video.title}": ${error.message}`);
          } else {
            refreshCount++;
          }
        }
      } catch (error) {
        errors.push(`Videos refresh failed: ${error}`);
      }
    }

    // Refresh podcasts
    if (!type || type === 'podcasts') {
      try {
        for (const podcast of EXTERNAL_SOURCES.podcasts) {
          const { error } = await supabase
            .from('knowledge_items')
            .upsert({
              title: podcast.title,
              type: 'podcast',
              content: podcast.content,
              category: podcast.category,
              tags: podcast.tags,
              difficulty: podcast.difficulty,
              author: podcast.author,
              duration: podcast.duration,
              source: 'external',
              is_active: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'title,type'
            });

          if (error) {
            errors.push(`Podcast "${podcast.title}": ${error.message}`);
          } else {
            refreshCount++;
          }
        }
      } catch (error) {
        errors.push(`Podcasts refresh failed: ${error}`);
      }
    }

    // Archive old items if force refresh
    if (force) {
      try {
        const { error } = await supabase
          .from('knowledge_items')
          .update({ is_active: false })
          .eq('source', 'external')
          .lt('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          errors.push(`Archive old items failed: ${error.message}`);
        }
      } catch (error) {
        errors.push(`Archive failed: ${error}`);
      }
    }

    // Revalidate Next.js cache
    try {
      revalidatePath('/knowledge');
      revalidatePath('/knowledge/[id]', 'page');
    } catch (error) {
      logger.warn('Failed to revalidate cache:', error);
    }

    logger.info('Knowledge refresh completed', { 
      refreshCount, 
      errors: errors.length,
      type 
    });

    return NextResponse.json({
      success: true,
      data: {
        refreshCount,
        errors,
        type: type || 'all',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error in knowledge refresh:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Knowledge refresh API is running',
    timestamp: new Date().toISOString()
  });
}
