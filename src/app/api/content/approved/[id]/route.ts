import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Item ID is required'
      }, { status: 400 });
    }

    logger.info(`Fetching knowledge item: id=${id}`);

    // Try to fetch from Supabase first
    try {
      const supabase = getSupabaseServiceClient();
      
      const { data: item, error } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (!error && item) {
        logger.info(`Knowledge item found in database: id=${id}`);
        return NextResponse.json({
          success: true,
          data: { item }
        });
      }
    } catch (dbError) {
      logger.warn(`Database fetch failed for item ${id}, using fallback: ${dbError}`);
    }

    // Fallback to mock data (synchronized with knowledge page)
    const mockItems = [
      {
        id: '0b012f34-1c42-4aea-8eae-b0165d4c0712',
        type: 'article',
        title: 'Welkom bij Stratalia',
        content: 'Leer meer over Nederlandse straattaal en hoe je het kunt gebruiken. Deze kennisbank bevat artikelen, video\'s en podcasts over straattaal.',
        author: 'Stratalia Team',
        category: 'introductie',
        tags: ['introductie', 'straattaal', 'leren'],
        difficulty: 'beginner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        duration: 300,
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        duration: 1800,
        audio_url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
        thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        word_count: 120,
        thumbnail_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        word_count: 75,
        thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        word_count: 200,
        thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
      }
    ];

    const foundItem = mockItems.find(item => item.id === id);
    
    if (foundItem) {
      logger.info(`Knowledge item found in fallback data: id=${id}`);
      return NextResponse.json({
        success: true,
        data: { item: foundItem }
      });
    }

    logger.warn(`Knowledge item not found: id=${id}`);
    return NextResponse.json({
      success: false,
      error: 'Item not found'
    }, { status: 404 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error in content API:', error instanceof Error ? error : new Error(errorMessage));
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}