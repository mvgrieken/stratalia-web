'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import KnowledgeFilters from './KnowledgeFilters';
import NoResults from './NoResults';

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

interface KnowledgeClientProps {
  initialItems: KnowledgeItem[];
}

export default function KnowledgeClient({ initialItems }: KnowledgeClientProps) {
  const [items] = useState<KnowledgeItem[]>(initialItems);
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>(initialItems);
  const [filters, setFilters] = useState({
    searchQuery: '',
    selectedType: 'all',
    selectedDifficulty: 'all'
  });

  const filterItems = useCallback(() => {
    let filtered = items;

    if (filters.selectedType !== 'all') {
      filtered = filtered.filter(item => item.type === filters.selectedType);
    }

    if (filters.selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === filters.selectedDifficulty);
    }

    if (filters.searchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  }, [items, filters]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return '📄';
      case 'video': return '🎥';
      case 'podcast': return '🎧';
      case 'infographic': return '📊';
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

  const getTypeStats = () => {
    const stats = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const typeStats = getTypeStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kennisbank
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ontdek artikelen, video's, podcasts en meer over Nederlandse straattaal. 
            Leer van experts en deel je kennis met de community.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{items.length}</div>
            <div className="text-sm text-gray-600">Totaal items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{typeStats.article || 0}</div>
            <div className="text-sm text-gray-600">Artikelen</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{typeStats.video || 0}</div>
            <div className="text-sm text-gray-600">Video's</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{typeStats.podcast || 0}</div>
            <div className="text-sm text-gray-600">Podcasts</div>
          </div>
        </div>

        {/* Filters */}
        <KnowledgeFilters onFiltersChange={setFilters} />

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredItems.length} van {items.length} items gevonden
          </p>
        </div>

        {/* Knowledge Items Grid */}
        {filteredItems.length === 0 ? (
          <NoResults 
            onClearFilters={() => setFilters({
              searchQuery: '',
              selectedType: 'all',
              selectedDifficulty: 'all'
            })}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Thumbnail */}
                {item.thumbnail_url && (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <span className="text-sm text-gray-500 capitalize">
                        {item.type}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.content}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Door {item.author}</span>
                    <div className="flex items-center space-x-3">
                      {item.duration && (
                        <span>⏱️ {Math.floor(item.duration / 60)}m</span>
                      )}
                      {item.word_count && (
                        <span>📝 {item.word_count} woorden</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{item.tags.length - 3} meer
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/knowledge/${item.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Bekijk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
