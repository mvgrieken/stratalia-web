/**
 * Mock knowledge items data for development and testing
 */

export interface MockKnowledgeItem {
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
  video_url?: string;
  audio_url?: string;
  duration?: number;
  word_count?: number;
}

export const mockKnowledgeItems: MockKnowledgeItem[] = [
  {
    id: '1',
    title: 'De Geschiedenis van Straattaal',
    content: 'Straattaal heeft een rijke geschiedenis die teruggaat tot de jaren 80. Het ontstond in de multiculturele wijken van grote steden waar verschillende talen en culturen samenkwamen. In deze artikel leer je over de oorsprong en ontwikkeling van straattaal in Nederland.',
    type: 'article',
    difficulty: 'beginner',
    category: 'geschiedenis',
    tags: ['geschiedenis', 'oorsprong', 'cultuur', 'multicultureel'],
    author: 'Dr. Maria van der Berg',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    is_active: true,
    word_count: 1200
  },
  {
    id: '2',
    title: 'Straattaal in de Media',
    content: 'Hoe straattaal de mainstream media heeft beïnvloed en vice versa. Van muziek tot films, straattaal is overal te vinden.',
    type: 'video',
    difficulty: 'intermediate',
    category: 'media',
    tags: ['media', 'muziek', 'films', 'influentie'],
    author: 'Prof. Jan de Vries',
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-media.jpg',
    video_url: '/videos/straattaal-media.mp4',
    duration: 1800
  },
  {
    id: '3',
    title: 'Podcast: Straattaal Experts',
    content: 'Een gesprek met experts over de evolutie van straattaal en hoe het de Nederlandse taal beïnvloedt.',
    type: 'podcast',
    difficulty: 'advanced',
    category: 'taalkunde',
    tags: ['podcast', 'experts', 'evolutie', 'taalkunde'],
    author: 'Straattaal Podcast Team',
    created_at: '2024-01-25T09:15:00Z',
    updated_at: '2024-01-25T09:15:00Z',
    is_active: true,
    audio_url: '/audio/straattaal-experts.mp3',
    duration: 2400
  },
  {
    id: '4',
    title: 'Infographic: Populaire Straattaal Woorden',
    content: 'Een visuele gids van de meest populaire straattaal woorden en hun betekenissen.',
    type: 'infographic',
    difficulty: 'beginner',
    category: 'woorden',
    tags: ['infographic', 'populair', 'woorden', 'betekenis'],
    author: 'Design Team',
    created_at: '2024-01-30T16:45:00Z',
    updated_at: '2024-01-30T16:45:00Z',
    is_active: true,
    thumbnail_url: '/images/populaire-woorden.jpg'
  },
  {
    id: '5',
    title: 'Straattaal in het Onderwijs',
    content: 'Hoe docenten straattaal kunnen gebruiken om leerlingen te betrekken bij het leren van de Nederlandse taal.',
    type: 'article',
    difficulty: 'intermediate',
    category: 'onderwijs',
    tags: ['onderwijs', 'docenten', 'leerlingen', 'taalonderwijs'],
    author: 'Dr. Lisa van Dijk',
    created_at: '2024-02-05T11:20:00Z',
    updated_at: '2024-02-05T11:20:00Z',
    is_active: true,
    word_count: 1500
  },
  {
    id: '6',
    title: 'Video: Straattaal in de Muziek',
    content: 'Een diepgaande analyse van hoe straattaal wordt gebruikt in Nederlandse rap en hip-hop.',
    type: 'video',
    difficulty: 'advanced',
    category: 'muziek',
    tags: ['muziek', 'rap', 'hip-hop', 'analyse'],
    author: 'Muziek Expert Team',
    created_at: '2024-02-10T13:00:00Z',
    updated_at: '2024-02-10T13:00:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-muziek.jpg',
    video_url: '/videos/straattaal-muziek.mp4',
    duration: 2100
  },
  {
    id: '7',
    title: 'Podcast: Straattaal en Identiteit',
    content: 'Hoe straattaal wordt gebruikt om identiteit uit te drukken en gemeenschappen te vormen.',
    type: 'podcast',
    difficulty: 'intermediate',
    category: 'sociologie',
    tags: ['identiteit', 'gemeenschap', 'sociologie', 'cultuur'],
    author: 'Sociologie Podcast',
    created_at: '2024-02-15T08:30:00Z',
    updated_at: '2024-02-15T08:30:00Z',
    is_active: true,
    audio_url: '/audio/straattaal-identiteit.mp3',
    duration: 2700
  },
  {
    id: '8',
    title: 'Infographic: Straattaal per Regio',
    content: 'Een overzicht van hoe straattaal verschilt per regio in Nederland.',
    type: 'infographic',
    difficulty: 'beginner',
    category: 'geografie',
    tags: ['regio', 'geografie', 'verschillen', 'overzicht'],
    author: 'Geografie Team',
    created_at: '2024-02-20T12:15:00Z',
    updated_at: '2024-02-20T12:15:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-regio.jpg'
  },
  {
    id: '9',
    title: 'Straattaal en Sociale Media',
    content: 'Hoe sociale media platforms de verspreiding en evolutie van straattaal beïnvloeden.',
    type: 'article',
    difficulty: 'intermediate',
    category: 'sociale media',
    tags: ['sociale media', 'verspreiding', 'evolutie', 'platforms'],
    author: 'Dr. Tom van der Meer',
    created_at: '2024-02-25T15:45:00Z',
    updated_at: '2024-02-25T15:45:00Z',
    is_active: true,
    word_count: 1800
  },
  {
    id: '10',
    title: 'Video: Straattaal in Films',
    content: 'Een analyse van hoe straattaal wordt gebruikt in Nederlandse films en series.',
    type: 'video',
    difficulty: 'advanced',
    category: 'film',
    tags: ['film', 'series', 'analyse', 'gebruik'],
    author: 'Film Analyse Team',
    created_at: '2024-03-01T10:30:00Z',
    updated_at: '2024-03-01T10:30:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-films.jpg',
    video_url: '/videos/straattaal-films.mp4',
    duration: 1950
  },
  {
    id: '11',
    title: 'Podcast: Straattaal en Generaties',
    content: 'Hoe verschillende generaties straattaal gebruiken en begrijpen.',
    type: 'podcast',
    difficulty: 'intermediate',
    category: 'generaties',
    tags: ['generaties', 'gebruik', 'begrip', 'verschillen'],
    author: 'Generatie Podcast',
    created_at: '2024-03-05T14:20:00Z',
    updated_at: '2024-03-05T14:20:00Z',
    is_active: true,
    audio_url: '/audio/straattaal-generaties.mp3',
    duration: 2250
  },
  {
    id: '12',
    title: 'Infographic: Straattaal Woordenboek',
    content: 'Een visueel woordenboek van de meest gebruikte straattaal woorden.',
    type: 'infographic',
    difficulty: 'beginner',
    category: 'woordenboek',
    tags: ['woordenboek', 'gebruikt', 'visueel', 'overzicht'],
    author: 'Woordenboek Team',
    created_at: '2024-03-10T09:00:00Z',
    updated_at: '2024-03-10T09:00:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-woordenboek.jpg'
  },
  {
    id: '13',
    title: 'Straattaal en Taalverandering',
    content: 'Hoe straattaal bijdraagt aan de evolutie van de Nederlandse taal.',
    type: 'article',
    difficulty: 'advanced',
    category: 'taalkunde',
    tags: ['taalverandering', 'evolutie', 'taalkunde', 'bijdrage'],
    author: 'Prof. Dr. Anna van der Berg',
    created_at: '2024-03-15T11:45:00Z',
    updated_at: '2024-03-15T11:45:00Z',
    is_active: true,
    word_count: 2000
  },
  {
    id: '14',
    title: 'Video: Straattaal in de Literatuur',
    content: 'Hoe schrijvers straattaal gebruiken in hun werken en wat dit betekent voor de literatuur.',
    type: 'video',
    difficulty: 'advanced',
    category: 'literatuur',
    tags: ['literatuur', 'schrijvers', 'gebruik', 'betekenis'],
    author: 'Literatuur Expert Team',
    created_at: '2024-03-20T16:00:00Z',
    updated_at: '2024-03-20T16:00:00Z',
    is_active: true,
    thumbnail_url: '/images/straattaal-literatuur.jpg',
    video_url: '/videos/straattaal-literatuur.mp4',
    duration: 2400
  },
  {
    id: '15',
    title: 'Podcast: Straattaal en Migratie',
    content: 'De rol van migratie in de ontwikkeling van straattaal in Nederland.',
    type: 'podcast',
    difficulty: 'intermediate',
    category: 'migratie',
    tags: ['migratie', 'ontwikkeling', 'rol', 'geschiedenis'],
    author: 'Migratie Podcast',
    created_at: '2024-03-25T13:30:00Z',
    updated_at: '2024-03-25T13:30:00Z',
    is_active: true,
    audio_url: '/audio/straattaal-migratie.mp3',
    duration: 2550
  }
];

// Service functions for knowledge items
export function getKnowledgeItems(filters?: {
  type?: 'article' | 'video' | 'podcast' | 'infographic';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}): MockKnowledgeItem[] {
  let items = mockKnowledgeItems.filter(item => item.is_active);
  
  if (filters) {
    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }
    
    if (filters.difficulty) {
      items = items.filter(item => item.difficulty === filters.difficulty);
    }
    
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }
  }
  
  // Sort by created_at (newest first)
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  // Apply pagination
  const offset = filters?.offset || 0;
  const limit = filters?.limit || 10;
  
  return items.slice(offset, offset + limit);
}

export function getKnowledgeItemById(id: string): MockKnowledgeItem | undefined {
  return mockKnowledgeItems.find(item => item.id === id);
}

export function searchKnowledgeItems(query: string, limit: number = 10): MockKnowledgeItem[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  const results = mockKnowledgeItems.filter(item => 
    item.is_active && (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.content.toLowerCase().includes(normalizedQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      item.category.toLowerCase().includes(normalizedQuery)
    )
  );
  
  // Sort by relevance (title matches first, then content, then tags)
  results.sort((a, b) => {
    const aTitleMatch = a.title.toLowerCase().includes(normalizedQuery);
    const bTitleMatch = b.title.toLowerCase().includes(normalizedQuery);
    
    if (aTitleMatch && !bTitleMatch) return -1;
    if (!aTitleMatch && bTitleMatch) return 1;
    
    return 0;
  });
  
  return results.slice(0, limit);
}

export function getKnowledgeItemsByCategory(category: string): MockKnowledgeItem[] {
  return mockKnowledgeItems.filter(item => 
    item.is_active && item.category === category
  );
}

export function getKnowledgeItemsByType(type: 'article' | 'video' | 'podcast' | 'infographic'): MockKnowledgeItem[] {
  return mockKnowledgeItems.filter(item => 
    item.is_active && item.type === type
  );
}

export function getKnowledgeItemsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): MockKnowledgeItem[] {
  return mockKnowledgeItems.filter(item => 
    item.is_active && item.difficulty === difficulty
  );
}

export function getKnowledgeStats(): {
  total: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  byCategory: Record<string, number>;
} {
  const byType = mockKnowledgeItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byDifficulty = mockKnowledgeItems.reduce((acc, item) => {
    acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byCategory = mockKnowledgeItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: mockKnowledgeItems.length,
    byType,
    byDifficulty,
    byCategory
  };
}

export function getRandomKnowledgeItems(count: number = 5): MockKnowledgeItem[] {
  const activeItems = mockKnowledgeItems.filter(item => item.is_active);
  const shuffled = [...activeItems].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
