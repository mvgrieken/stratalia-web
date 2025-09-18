import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

// Mock content sources for demonstration
const CONTENT_SOURCES = [
  {
    id: 'straattaal-blog',
    name: 'Straattaal Blog',
    type: 'rss',
    url: 'https://example.com/straattaal-blog/rss',
    lastCrawl: null,
    enabled: true
  },
  {
    id: 'youtube-straattaal',
    name: 'Straattaal YouTube Kanaal',
    type: 'youtube_channel',
    url: 'https://www.youtube.com/channel/straattaal',
    lastCrawl: null,
    enabled: true
  },
  {
    id: 'podcast-straattaal',
    name: 'Straattaal Podcast',
    type: 'podcast_feed',
    url: 'https://example.com/straattaal-podcast/feed.xml',
    lastCrawl: null,
    enabled: true
  }
];

// Mock content items that would be discovered
const MOCK_DISCOVERED_CONTENT = [
  {
    title: "Nieuwe Straattaal Trends 2024",
    description: "Een overzicht van de nieuwste straattaal woorden en uitdrukkingen die populair zijn geworden in 2024.",
    content_type: "article",
    source_url: "https://example.com/straattaal-trends-2024",
    thumbnail_url: "https://example.com/images/straattaal-trends.jpg",
    author: "Straattaal Expert",
    tags: ["trends", "2024", "nieuwe woorden"],
    difficulty: "intermediate",
    source_type: "auto_discovery",
    source_id: "straattaal-blog"
  },
  {
    title: "Straattaal in Nederlandse Films",
    description: "Hoe straattaal wordt gebruikt in Nederlandse films en series, met voorbeelden uit populaire producties.",
    content_type: "video",
    source_url: "https://www.youtube.com/watch?v=straattaal-films",
    thumbnail_url: "https://example.com/images/straattaal-films.jpg",
    author: "Film & Taal Channel",
    tags: ["films", "series", "media", "cultuur"],
    difficulty: "beginner",
    source_type: "auto_discovery",
    source_id: "youtube-straattaal"
  },
  {
    title: "Podcast: Straattaal Geschiedenis",
    description: "Een diepgaande podcast over de geschiedenis van Nederlandse straattaal en zijn culturele invloeden.",
    content_type: "podcast",
    source_url: "https://example.com/podcast/straattaal-geschiedenis",
    thumbnail_url: "https://example.com/images/podcast-geschiedenis.jpg",
    author: "Taal Historici",
    tags: ["geschiedenis", "cultuur", "podcast"],
    difficulty: "advanced",
    source_type: "auto_discovery",
    source_id: "podcast-straattaal"
  },
  {
    title: "Straattaal Woord van de Dag",
    description: "Dagelijkse uitleg van een straattaal woord met voorbeelden en context.",
    content_type: "article",
    source_url: "https://example.com/woord-van-de-dag",
    thumbnail_url: "https://example.com/images/woord-van-de-dag.jpg",
    author: "Straattaal Daily",
    tags: ["woordenschat", "dagelijks", "educatief"],
    difficulty: "beginner",
    source_type: "auto_discovery",
    source_id: "straattaal-blog"
  }
];

export async function POST(request: NextRequest) {
  try {
    // Get current user from session for admin check
    const supabase = getSupabaseServiceClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { source_types = ['rss', 'youtube_channel', 'podcast_feed'], force_update = false } = body;

    logger.info(`Admin ${session.user.email} starting content crawl for types: ${source_types.join(', ')}`);

    // Simulate content discovery process
    const discoveredContent = MOCK_DISCOVERED_CONTENT.filter(item => 
      source_types.includes(item.source_type) || source_types.includes('all')
    );

    // Check for existing content to avoid duplicates
    const { data: existingProposals, error: existingError } = await supabase
      .from('content_proposals')
      .select('proposed_data')
      .eq('source_type', 'auto_discovery');

    if (existingError) {
      logger.error('Error checking existing content proposals:', existingError);
      return NextResponse.json({ error: 'Failed to check existing proposals', details: existingError.message }, { status: 500 });
    }

    const existingUrls = new Set(
      existingProposals?.map(proposal => proposal.proposed_data?.source_url).filter(Boolean) || []
    );

    // Filter out content that already exists
    const newContent = discoveredContent.filter(item => !existingUrls.has(item.source_url));

    if (newContent.length === 0) {
      logger.info('No new content discovered');
      return NextResponse.json({ 
        success: true, 
        message: 'No new content discovered',
        results: {
          sources_checked: CONTENT_SOURCES.length,
          sources_successful: CONTENT_SOURCES.length,
          new_proposals: 0,
          total_discovered: discoveredContent.length
        }
      });
    }

    // Create content proposals for new content
    const proposals = newContent.map(item => ({
      proposal_type: 'new',
      proposed_data: item,
      source_type: 'auto_discovery',
      status: 'pending',
      priority_score: Math.floor(Math.random() * 10) + 1, // Random priority 1-10
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data: insertedProposals, error: insertError } = await supabase
      .from('content_proposals')
      .insert(proposals)
      .select();

    if (insertError) {
      logger.error('Error inserting content proposals:', insertError);
      return NextResponse.json({ error: 'Failed to insert content proposals', details: insertError.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('admin_actions').insert({
      admin_user_id: session.user.id,
      action_type: 'content_crawl',
      action_details: {
        source_types: source_types,
        sources_checked: CONTENT_SOURCES.length,
        sources_successful: CONTENT_SOURCES.length,
        new_proposals: insertedProposals?.length || 0,
        total_discovered: discoveredContent.length,
        proposals: insertedProposals?.map(p => ({ id: p.id, title: p.proposed_data.title })) || []
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    logger.info(`Successfully created ${insertedProposals?.length || 0} new content proposals`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Content crawl completed successfully`,
      results: {
        sources_checked: CONTENT_SOURCES.length,
        sources_successful: CONTENT_SOURCES.length,
        new_proposals: insertedProposals?.length || 0,
        total_discovered: discoveredContent.length,
        proposals: insertedProposals?.map(p => ({ id: p.id, title: p.proposed_data.title })) || []
      }
    });

  } catch (error) {
    logger.error('Error in /api/admin/crawl-content POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get current user from session for admin check
    const supabase = getSupabaseServiceClient();
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: currentProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get crawl statistics
    const { data: crawlActions, error: crawlError } = await supabase
      .from('admin_actions')
      .select('action_details, created_at')
      .eq('action_type', 'content_crawl')
      .order('created_at', { ascending: false })
      .limit(10);

    if (crawlError) {
      logger.error('Error fetching crawl statistics:', crawlError);
      return NextResponse.json({ error: 'Failed to fetch crawl statistics', details: crawlError.message }, { status: 500 });
    }

    // Get pending content proposals from auto discovery
    const { data: pendingProposals, error: proposalsError } = await supabase
      .from('content_proposals')
      .select('id, proposed_data, created_at')
      .eq('source_type', 'auto_discovery')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20);

    if (proposalsError) {
      logger.error('Error fetching pending proposals:', proposalsError);
      return NextResponse.json({ error: 'Failed to fetch pending proposals', details: proposalsError.message }, { status: 500 });
    }

    // Calculate statistics
    const totalCrawls = crawlActions?.length || 0;
    const totalProposals = crawlActions?.reduce((sum, action) => 
      sum + (action.action_details?.new_proposals || 0), 0) || 0;
    const lastCrawl = crawlActions?.[0]?.created_at || null;

    return NextResponse.json({
      sources: CONTENT_SOURCES,
      statistics: {
        totalCrawls,
        totalProposals,
        lastCrawl,
        pendingProposals: pendingProposals?.length || 0
      },
      recentCrawls: crawlActions?.slice(0, 5) || [],
      pendingProposals: pendingProposals?.map(p => ({
        id: p.id,
        title: p.proposed_data?.title,
        type: p.proposed_data?.content_type,
        created_at: p.created_at
      })) || []
    });

  } catch (error) {
    logger.error('Error in /api/admin/crawl-content GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}