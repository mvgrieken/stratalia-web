'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  video_url?: string;
  audio_url?: string;
  duration?: number;
  word_count?: number;
  slug?: string;
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
    selectedDifficulty: 'all',
    selectedTags: [] as string[],
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const handleFiltersChange = useCallback((f: { searchQuery: string; selectedType: string; selectedDifficulty: string; selectedTags?: string[]; sortBy?: string; sortOrder?: 'asc' | 'desc' }) => {
    setFilters({
      searchQuery: f.searchQuery,
      selectedType: f.selectedType,
      selectedDifficulty: f.selectedDifficulty,
      selectedTags: f.selectedTags ?? [],
      sortBy: f.sortBy ?? 'created_at',
      sortOrder: f.sortOrder ?? 'desc'
    });
  }, []);

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

    if (filters.selectedTags && filters.selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        filters.selectedTags!.every(tag => item.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'word_count':
          aValue = a.word_count || 0;
          bValue = b.word_count || 0;
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          aValue = difficultyOrder[a.difficulty] || 0;
          bValue = difficultyOrder[b.difficulty] || 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setFilteredItems(filtered);
  }, [items, filters]);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  // Get all unique tags from items
  const availableTags = React.useMemo(() => {
    const allTags = items.flatMap(item => item.tags);
    return Array.from(new Set(allTags)).sort();
  }, [items]);

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
        <KnowledgeFilters onFiltersChange={handleFiltersChange} availableTags={availableTags} />

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
              selectedDifficulty: 'all',
              selectedTags: []
            })}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/knowledge/${item.slug || item.id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 group"
                aria-label={`Bekijk ${item.title} - ${item.type} door ${item.author}`}
              >
                {/* Thumbnail */}
                {item.thumbnail_url ? (
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gray-100">
                              <span class="text-4xl">${getTypeIcon(item.type)}</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-6xl">{getTypeIcon(item.type)}</span>
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
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Add tag to selected tags
                          const newTags = filters.selectedTags.includes(tag)
                            ? filters.selectedTags.filter(t => t !== tag)
                            : [...filters.selectedTags, tag];
                          handleFiltersChange({
                            searchQuery: filters.searchQuery,
                            selectedType: filters.selectedType,
                            selectedDifficulty: filters.selectedDifficulty,
                            selectedTags: newTags,
                            sortBy: filters.sortBy,
                            sortOrder: filters.sortOrder
                          });
                        }}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        +{item.tags.length - 3} meer
                      </span>
                    )}
                  </div>

                  {/* Hover indicator */}
                  <div className="mt-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 text-sm font-medium flex items-center">
                    Bekijk details
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
