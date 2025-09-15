import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { config, isSupabaseConfigured } from '@/lib/config';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'podcast' | 'infographic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_url?: string;
  duration?: number;
  word_count?: number;
}

// Comprehensive fallback knowledge content
const FALLBACK_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'fallback-1',
    title: 'De Geschiedenis van Nederlandse Straattaal',
    content: 'Straattaal in Nederland heeft een rijke geschiedenis die teruggaat tot de jaren 80. Het ontstond in multiculturele wijken waar verschillende talen en culturen samenkwamen. Vandaag de dag is straattaal een integraal onderdeel van de Nederlandse jeugdcultuur.',
    type: 'article',
    difficulty: 'beginner',
    category: 'geschiedenis',
    tags: ['geschiedenis', 'cultuur', 'jeugd'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    word_count: 150
  },
  {
    id: 'fallback-2',
    title: 'Top 10 Meest Gebruikte Straattaalwoorden',
    content: 'Ontdek de meest populaire straattaalwoorden van dit moment: 1. Skeer - arm zijn, 2. Breezy - cool, relaxed, 3. Flexen - opscheppen, 4. Chill - ontspannen, 5. Dope - geweldig, 6. Lit - fantastisch, 7. Fire - geweldig, 8. Vibe - sfeer, 9. Mood - stemming, 10. Goals - doelen.',
    type: 'infographic',
    difficulty: 'beginner',
    category: 'woordenlijst',
    tags: ['top 10', 'populair', 'woorden'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    word_count: 75
  },
  {
    id: 'fallback-3',
    title: 'Straattaal in Social Media',
    content: 'Hoe straattaal zich verspreidt via Instagram, TikTok en andere platforms. Social media speelt een cruciale rol in de evolutie van straattaal, met nieuwe woorden die viral gaan en binnen dagen door miljoenen jongeren worden gebruikt.',
    type: 'article',
    difficulty: 'intermediate',
    category: 'social media',
    tags: ['social media', 'viral', 'trends'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    word_count: 200
  },
  {
    id: 'fallback-4',
    title: 'Podcast: Straattaal in de Muziek',
    content: 'Een diepgaande discussie over hoe Nederlandse rappers en artiesten straattaal gebruiken in hun muziek. Van de vroege hip-hop tot moderne trap, straattaal heeft altijd een belangrijke rol gespeeld in de Nederlandse muziekscene.',
    type: 'podcast',
    difficulty: 'intermediate',
    category: 'muziek',
    tags: ['muziek', 'rap', 'hip-hop', 'cultuur'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    duration: 1800 // 30 minutes
  },
  {
    id: 'fallback-5',
    title: 'Video: Hoe Spreek Je Straattaal Uit?',
    content: 'Een visuele gids voor de juiste uitspraak van populaire straattaalwoorden. Leer de subtiele verschillen in intonatie en accent die straattaal zo uniek maken.',
    type: 'video',
    difficulty: 'beginner',
    category: 'uitspraak',
    tags: ['uitspraak', 'video', 'leer'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    duration: 300, // 5 minutes
    thumbnail_url: '/images/straattaal-uitspraak.jpg'
  },
  {
    id: 'fallback-6',
    title: 'De Psychologie van Straattaal',
    content: 'Waarom gebruiken jongeren straattaal? Een psychologische analyse van de sociale functies van straattaal, inclusief groepsvorming, identiteit en rebellie tegen de gevestigde orde.',
    type: 'article',
    difficulty: 'advanced',
    category: 'psychologie',
    tags: ['psychologie', 'sociologie', 'identiteit'],
    author: 'Stratalia Team',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    word_count: 500
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const difficulty = searchParams.get('difficulty') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log(`📚 Fetching knowledge items - Type: ${type}, Difficulty: ${difficulty}, Limit: ${limit}`);

    // Try database first if Supabase is configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient(config.supabase.url, config.supabase.anonKey);

        // Build query
        let query = supabase
          .from('knowledge_items')
          .select('*')
          .eq('is_active', true)
          .limit(limit);

        // Apply filters
        if (type !== 'all') {
          query = query.eq('type', type);
        }

        if (difficulty !== 'all') {
          query = query.eq('difficulty', difficulty);
        }

        const { data: items, error } = await query;

        if (!error && items && items.length > 0) {
          console.log(`✅ Found ${items.length} knowledge items from database`);
          return NextResponse.json({
            items,
            total: items.length,
            source: 'database'
          });
        }
      } catch (dbError) {
        console.log('Database knowledge items failed, using fallback');
      }
    }

    // Fallback: Use hardcoded knowledge items
    let filteredItems = FALLBACK_KNOWLEDGE;

    // Apply filters to fallback data
    if (type !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === type);
    }

    if (difficulty !== 'all') {
      filteredItems = filteredItems.filter(item => item.difficulty === difficulty);
    }

    // Limit results
    const limitedItems = filteredItems.slice(0, limit);

    console.log(`✅ Using ${limitedItems.length} fallback knowledge items`);
    return NextResponse.json({
      items: limitedItems,
      total: limitedItems.length,
      source: 'fallback'
    });

  } catch (error) {
    console.error('💥 Error in knowledge items API:', error);
    
    // Return emergency fallback
    const emergencyItems = FALLBACK_KNOWLEDGE.slice(0, 3);
    return NextResponse.json({
      items: emergencyItems,
      total: emergencyItems.length,
      source: 'error-fallback'
    });
  }
}