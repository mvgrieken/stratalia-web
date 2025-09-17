import Navigation from '@/components/Navigation';
import { getSupabaseClient } from '@/lib/supabase-client';
import KnowledgeClient from './KnowledgeClient';

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
          thumbnail_url: '/images/straattaal-video.jpg'
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
          thumbnail_url: '/images/podcast-cover.jpg'
        }
      ];
    }
  } catch (err) {
    console.error('Error fetching knowledge items:', err);
    error = 'Er is een fout opgetreden bij het laden van de kennisbank.';
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fout bij laden</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Opnieuw proberen
            </button>
          </div>
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