import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Enhanced admin authentication
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_TOKEN || 'admin-token';
    
    if (!authHeader || authHeader !== adminToken) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      logger.warn(`Unauthorized admin access attempt - hasHeader: ${!!authHeader}, headerValue: ${authHeader ? 'SET' : 'MISSING'}, ip: ${ip}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();

    // Clear existing items
    await supabase.from('knowledge_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert comprehensive knowledge items
    const knowledgeItems = [
      {
        id: '0b012f34-1c42-4aea-8eae-b0165d4c0712',
        type: 'article',
        title: 'Welkom bij Stratalia',
        content: 'Leer meer over Nederlandse straattaal en hoe je het kunt gebruiken. Deze kennisbank bevat artikelen, video\'s en podcasts over straattaal.',
        author: 'Stratalia Team',
        category: 'introductie',
        tags: ['introductie', 'straattaal', 'leren'],
        difficulty: 'beginner',
        description: 'Een introductie tot de Stratalia kennisbank',
        word_count: 50
      },
      {
        id: '1614551a-e197-42ff-ac1d-b7573f5cfd7f',
        type: 'video',
        title: 'Straattaal voor Beginners',
        content: 'Een video introductie tot Nederlandse straattaal. Leer de basiswoorden en hoe je ze kunt gebruiken.',
        author: 'Stratalia Team',
        category: 'video',
        tags: ['video', 'beginners', 'introductie'],
        difficulty: 'beginner',
        description: 'Video introductie tot straattaal',
        duration: '5:00',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop',
        word_count: 50
      },
      {
        id: '6dd5b2b4-2c9c-48dc-b632-01d70de074a2',
        type: 'podcast',
        title: 'Straattaal Podcast',
        content: 'Luister naar gesprekken over straattaal en cultuur. Experts delen hun kennis over de evolutie van straattaal.',
        author: 'Stratalia Team',
        category: 'podcast',
        tags: ['podcast', 'cultuur', 'experts'],
        difficulty: 'intermediate',
        description: 'Podcast over straattaal en cultuur',
        duration: '30:00',
        audio_url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop',
        word_count: 100
      },
      {
        id: 'fa845e60-d3c6-4136-bdf2-ebe750c2f1f7',
        type: 'article',
        title: 'Straattaal in Social Media',
        content: 'Ontdek hoe straattaal wordt gebruikt op sociale media platforms en wat de invloed is op de Nederlandse jeugdcultuur.',
        author: 'Stratalia Team',
        category: 'sociale-media',
        tags: ['sociale-media', 'jeugd', 'cultuur'],
        difficulty: 'intermediate',
        description: 'Artikel over straattaal op sociale media',
        thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
        word_count: 120
      },
      {
        id: 'd2c07aa3-aac1-4392-8234-9edb2601437a',
        type: 'article',
        title: 'Top 10 Straattaalwoorden',
        content: 'De meest populaire straattaalwoorden van dit moment. Van "skeer" tot "flexen" - leer de woorden die iedereen gebruikt.',
        author: 'Stratalia Team',
        category: 'woordenlijst',
        tags: ['top-10', 'populair', 'woorden'],
        difficulty: 'beginner',
        description: 'Top 10 populaire straattaalwoorden',
        thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
        word_count: 75
      },
      {
        id: '6454db1f-8518-4bec-b693-043f9372e18a',
        type: 'article',
        title: 'Straattaal Geschiedenis',
        content: 'Een diepgaande analyse van de geschiedenis van Nederlandse straattaal. Van de jaren 80 tot nu.',
        author: 'Dr. Taalwetenschap',
        category: 'geschiedenis',
        tags: ['geschiedenis', 'onderzoek', 'academisch'],
        difficulty: 'advanced',
        description: 'Geschiedenis van Nederlandse straattaal',
        thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        word_count: 200
      },
      {
        id: 'music-1',
        type: 'music',
        title: 'Straattaal in Nederlandse Rap',
        content: 'Ontdek hoe Nederlandse rappers straattaal gebruiken in hun muziek. Van Lil Kleine tot Boef - leer de woorden uit hun hits.',
        author: 'Stratalia Team',
        category: 'muziek',
        tags: ['muziek', 'rap', 'nederlandse-artiesten'],
        difficulty: 'intermediate',
        description: 'Straattaal in Nederlandse rap muziek',
        duration: '4:30',
        thumbnail_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
        word_count: 150
      },
      {
        id: 'video-2',
        type: 'video',
        title: 'Straattaal in Videoclips',
        content: 'Analyse van straattaal in Nederlandse videoclips. Zie hoe artiesten hun boodschap overbrengen met straattaal.',
        author: 'Stratalia Team',
        category: 'video',
        tags: ['video', 'videoclips', 'muziek'],
        difficulty: 'intermediate',
        description: 'Straattaal in Nederlandse videoclips',
        duration: '8:15',
        thumbnail_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        word_count: 180
      }
    ];

    const { error } = await supabase
      .from('knowledge_items')
      .insert(knowledgeItems);

    if (error) {
      logger.error('Error inserting knowledge items:', error);
      return NextResponse.json({ 
        error: 'Failed to refresh knowledge items',
        details: error.message 
      }, { status: 500 });
    }

    logger.info(`Successfully refreshed knowledge items: ${knowledgeItems.length} items inserted`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully refreshed knowledge items`,
      itemsInserted: knowledgeItems.length 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in refresh knowledge API:', error instanceof Error ? error : new Error(errorMessage));
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 });
  }
}
