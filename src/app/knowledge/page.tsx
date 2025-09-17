import Navigation from '@/components/Navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import KnowledgeClient from './KnowledgeClient';
import ErrorState from './ErrorState';

interface KnowledgeItem {
  id: string;
  type: 'article' | 'video' | 'podcast' | 'infographic' | 'book' | 'music';
  title: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_url?: string;
  duration?: number;
  word_count?: number;
}

export default async function KnowledgePage() {
  let items: KnowledgeItem[] = [];
  let error: string | null = null;

  try {
    // Fetch knowledge items directly from Supabase
    const supabase = getSupabaseClient();
    
    const { data: knowledgeItems, error: dbError } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      error = 'Er is een fout opgetreden bij het laden van de kennisbank.';
    } else if (knowledgeItems && knowledgeItems.length > 0) {
      items = knowledgeItems.map((item: any) => ({
        id: item.id,
        type: item.type || 'article',
        title: item.title,
        content: item.content,
        author: item.author || 'Stratalia Community',
        category: item.category || 'algemeen',
        tags: item.tags || ['straattaal', 'leren'],
        difficulty: item.difficulty || 'intermediate',
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_active: item.is_active !== false,
        thumbnail_url: item.thumbnail_url,
        duration: item.duration,
        word_count: item.word_count
      }));
    } else {
      // Fallback to default items if database is empty
      items = [
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
          type: 'infographic',
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
          type: 'book',
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
    }
  } catch (err) {
    console.error('Error fetching knowledge items:', err);
    error = 'Er is een fout opgetreden bij het laden van de kennisbank.';
  }

  // Always show fallback items if no items loaded and no error
  if (items.length === 0 && !error) {
    items = [
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
        thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=300&fit=crop'
      }
    ];
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorState error={error} />
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <KnowledgeClient initialItems={items} />
    </>
  );
}