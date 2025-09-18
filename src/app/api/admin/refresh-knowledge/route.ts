import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

// Mock knowledge items for demonstration
const MOCK_KNOWLEDGE_ITEMS = [
  {
    title: "Straattaal in de Media",
    content: "Hoe straattaal wordt gebruikt in Nederlandse films, series en muziek. Een overzicht van populaire uitdrukkingen en hun betekenis.",
    type: "article",
    difficulty: "beginner",
    tags: ["media", "cultuur", "taal"],
    source_url: "https://example.com/straattaal-media",
    author: "Stratalia Team"
  },
  {
    title: "Geschiedenis van Nederlandse Straattaal",
    content: "De ontwikkeling van straattaal in Nederland door de jaren heen. Van de jaren 80 tot nu, en de invloeden van verschillende culturen.",
    type: "article", 
    difficulty: "intermediate",
    tags: ["geschiedenis", "cultuur", "ontwikkeling"],
    source_url: "https://example.com/straattaal-geschiedenis",
    author: "Stratalia Team"
  },
  {
    title: "Straattaal in Amsterdam",
    content: "Specifieke straattaal uit Amsterdam en de verschillende wijken. Marokkaans-Nederlandse invloeden en lokale uitdrukkingen.",
    type: "article",
    difficulty: "intermediate", 
    tags: ["amsterdam", "lokaal", "marokkaans"],
    source_url: "https://example.com/straattaal-amsterdam",
    author: "Stratalia Team"
  },
  {
    title: "Straattaal Woordenschat - Basis",
    content: "De meest gebruikte straattaal woorden en hun betekenissen. Perfect voor beginners die willen starten met straattaal.",
    type: "article",
    difficulty: "beginner",
    tags: ["woordenschat", "basis", "beginners"],
    source_url: "https://example.com/straattaal-basis",
    author: "Stratalia Team"
  },
  {
    title: "Straattaal in Hip-Hop",
    content: "Hoe Nederlandse rappers straattaal gebruiken in hun muziek. Analyse van teksten en populaire uitdrukkingen.",
    type: "article",
    difficulty: "advanced",
    tags: ["muziek", "hip-hop", "rap", "cultuur"],
    source_url: "https://example.com/straattaal-hiphop",
    author: "Stratalia Team"
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

    logger.info(`Admin ${session.user.email} starting knowledge refresh`);

    // Check for existing items to avoid duplicates
    const { data: existingItems, error: existingError } = await supabase
      .from('knowledge_items')
      .select('title');

    if (existingError) {
      logger.error(`Error checking existing knowledge items: ${existingError instanceof Error ? existingError.message : String(existingError)}`);
      return NextResponse.json({ error: 'Failed to check existing items', details: existingError.message }, { status: 500 });
    }

    const existingTitles = new Set(existingItems?.map(item => item.title) || []);

    // Filter out items that already exist
    const newItems = MOCK_KNOWLEDGE_ITEMS.filter(item => !existingTitles.has(item.title));

    if (newItems.length === 0) {
      logger.info('No new knowledge items to add');
      return NextResponse.json({ 
        success: true, 
        message: 'No new knowledge items found',
        itemsInserted: 0,
        totalItems: MOCK_KNOWLEDGE_ITEMS.length
      });
    }

    // Insert new items
    const { data: insertedItems, error: insertError } = await supabase
      .from('knowledge_items')
      .insert(newItems.map(item => ({
        ...item,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))
      .select();

    if (insertError) {
      logger.error(`Error inserting knowledge items: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
      return NextResponse.json({ error: 'Failed to insert knowledge items', details: insertError.message }, { status: 500 });
    }

    // Log the action
    await supabase.from('admin_actions').insert({
      admin_user_id: session.user.id,
      action_type: 'refresh_knowledge',
      action_details: {
        items_inserted: insertedItems?.length || 0,
        total_available: MOCK_KNOWLEDGE_ITEMS.length,
        items: insertedItems?.map(item => ({ id: item.id, title: item.title })) || []
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    logger.info(`Successfully inserted ${insertedItems?.length || 0} new knowledge items`);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${insertedItems?.length || 0} new knowledge items`,
      itemsInserted: insertedItems?.length || 0,
      totalItems: MOCK_KNOWLEDGE_ITEMS.length,
      items: insertedItems?.map(item => ({ id: item.id, title: item.title })) || []
    });

  } catch (error) {
    logger.error(`Error in /api/admin/refresh-knowledge POST: ${error instanceof Error ? error.message : String(error)}`);
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

    // Get knowledge items statistics
    const { data: items, error: itemsError } = await supabase
      .from('knowledge_items')
      .select('id, title, type, difficulty, is_active, created_at');

    if (itemsError) {
      logger.error(`Error fetching knowledge items: ${itemsError instanceof Error ? itemsError.message : String(itemsError)}`);
      return NextResponse.json({ error: 'Failed to fetch knowledge items', details: itemsError.message }, { status: 500 });
    }

    // Calculate statistics
    const totalItems = items?.length || 0;
    const activeItems = items?.filter(item => item.is_active).length || 0;
    const itemsByType = items?.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    const itemsByDifficulty = items?.reduce((acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      totalItems,
      activeItems,
      inactiveItems: totalItems - activeItems,
      itemsByType,
      itemsByDifficulty,
      lastRefresh: items?.length > 0 ? Math.max(...items.map(item => new Date(item.created_at).getTime())) : null,
      items: items?.slice(0, 10) // Return first 10 items as preview
    });

  } catch (error) {
    logger.error(`Error in /api/admin/refresh-knowledge GET: ${error instanceof Error ? error.message : String(error)}`);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}