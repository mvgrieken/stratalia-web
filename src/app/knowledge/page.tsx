'use client';

import { useState, useEffect, useCallback } from 'react';

interface KnowledgeItem {
  id: string;
  type: 'article' | 'video' | 'podcast' | 'book' | 'music';
  title: string;
  author: string;
  description: string;
  url?: string;
  duration?: string;
  year?: number;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: number;
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledgeItems();
  }, []);

  const filterItems = useCallback(() => {
    let filtered = items;

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [items, selectedType, selectedDifficulty, searchQuery]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const fetchKnowledgeItems = async () => {
    try {
      // Mock knowledge base data
      const mockItems: KnowledgeItem[] = [
        {
          id: '1',
          type: 'article',
          title: 'Straattaal in de Nederlandse Media',
          author: 'Dr. Jan van der Berg',
          description: 'Een uitgebreide analyse van hoe straattaal wordt gebruikt in Nederlandse films, series en muziek.',
          url: 'https://example.com/straattaal-media',
          year: 2023,
          tags: ['media', 'cultuur', 'taalontwikkeling'],
          difficulty: 'intermediate',
          rating: 4.5,
          views: 1250
        },
        {
          id: '2',
          type: 'video',
          title: 'Straattaal voor Ouders - Documentaire',
          author: 'NPO 3',
          description: 'Een documentaire die ouders helpt om straattaal te begrijpen en de culturele achtergrond ervan.',
          url: 'https://youtube.com/watch?v=example',
          duration: '45 min',
          year: 2023,
          tags: ['ouders', 'documentaire', 'cultuur'],
          difficulty: 'beginner',
          rating: 4.8,
          views: 8900
        },
        {
          id: '3',
          type: 'podcast',
          title: 'Straatpraat Podcast - Aflevering 1',
          author: 'Straatpraat Team',
          description: 'De eerste aflevering van onze podcast over straattaal, met interviews en voorbeelden.',
          url: 'https://spotify.com/straatpraat',
          duration: '30 min',
          year: 2024,
          tags: ['podcast', 'interviews', 'voorbeelden'],
          difficulty: 'beginner',
          rating: 4.7,
          views: 2100
        },
        {
          id: '4',
          type: 'book',
          title: 'Straattaal Woordenboek 2024',
          author: 'Marieke van der Laan',
          description: 'Het meest complete woordenboek van Nederlandse straattaal, met uitleg en voorbeelden.',
          url: 'https://bol.com/straattaal-woordenboek',
          year: 2024,
          tags: ['woordenboek', 'referentie', 'compleet'],
          difficulty: 'intermediate',
          rating: 4.6,
          views: 3400
        },
        {
          id: '5',
          type: 'music',
          title: 'Top 10 Straattaal Hits',
          author: 'Spotify Playlist',
          description: 'Een playlist met de populairste Nederlandse nummers die straattaal bevatten.',
          url: 'https://spotify.com/playlist/straattaal-hits',
          duration: '45 min',
          year: 2024,
          tags: ['muziek', 'playlist', 'populair'],
          difficulty: 'beginner',
          rating: 4.4,
          views: 15600
        },
        {
          id: '6',
          type: 'article',
          title: 'De Psychologie achter Straattaal',
          author: 'Prof. Lisa de Vries',
          description: 'Wetenschappelijk onderzoek naar waarom jongeren straattaal gebruiken en wat het betekent.',
          url: 'https://example.com/psychologie-straattaal',
          year: 2023,
          tags: ['psychologie', 'onderzoek', 'jongeren'],
          difficulty: 'advanced',
          rating: 4.9,
          views: 2100
        }
      ];
      setItems(mockItems);
    } catch (error) {
      console.error('Error fetching knowledge items:', error);
    } finally {
      setLoading(false);
    }
  };


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'book': return '📚';
      case 'music': return '🎵';
      default: return '📄';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeCount = (type: string) => {
    return items.filter(item => item.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kennisbank wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Kennisbank</h1>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Zoek in de kennisbank..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle types ({items.length})</option>
                  <option value="article">📄 Artikelen ({getTypeCount('article')})</option>
                  <option value="video">🎥 Video's ({getTypeCount('video')})</option>
                  <option value="podcast">🎧 Podcasts ({getTypeCount('podcast')})</option>
                  <option value="book">📚 Boeken ({getTypeCount('book')})</option>
                  <option value="music">🎵 Muziek ({getTypeCount('music')})</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle niveaus</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Gemiddeld</option>
                  <option value="advanced">Gevorderd</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{getTypeIcon(item.type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>👤 {item.author}</span>
                    {item.year && <span className="ml-4">📅 {item.year}</span>}
                    {item.duration && <span className="ml-4">⏱️ {item.duration}</span>}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      👁️ {item.views.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Bekijk
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">Geen resultaten gevonden</p>
              <p className="text-gray-400 text-sm mt-2">
                Probeer andere filters of zoektermen
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kennisbank Statistieken</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                <div className="text-sm text-gray-600">Totaal Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{getTypeCount('article')}</div>
                <div className="text-sm text-gray-600">Artikelen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{getTypeCount('video')}</div>
                <div className="text-sm text-gray-600">Video's</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{getTypeCount('podcast')}</div>
                <div className="text-sm text-gray-600">Podcasts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{getTypeCount('book')}</div>
                <div className="text-sm text-gray-600">Boeken</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
