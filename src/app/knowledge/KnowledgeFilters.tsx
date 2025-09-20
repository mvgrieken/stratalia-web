'use client';

import React from 'react';

import { useState, useEffect, useRef } from 'react';

interface KnowledgeFiltersProps {
  onFiltersChange: (_filters: {
    searchQuery: string;
    selectedType: string;
    selectedDifficulty: string;
    selectedTags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => void;
  availableTags?: string[];
}

export default function KnowledgeFilters({ onFiltersChange, availableTags = [] }: KnowledgeFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = (newSearchQuery?: string, newSelectedType?: string, newSelectedDifficulty?: string, newSelectedTags?: string[], newSortBy?: string, newSortOrder?: 'asc' | 'desc') => {
    const updatedSearchQuery = newSearchQuery !== undefined ? newSearchQuery : searchQuery;
    const updatedSelectedType = newSelectedType !== undefined ? newSelectedType : selectedType;
    const updatedSelectedDifficulty = newSelectedDifficulty !== undefined ? newSelectedDifficulty : selectedDifficulty;
    const updatedSelectedTags = newSelectedTags !== undefined ? newSelectedTags : selectedTags;
    const updatedSortBy = newSortBy !== undefined ? newSortBy : sortBy;
    const updatedSortOrder = newSortOrder !== undefined ? newSortOrder : sortOrder;
    
    onFiltersChange({
      searchQuery: updatedSearchQuery,
      selectedType: updatedSelectedType,
      selectedDifficulty: updatedSelectedDifficulty,
      selectedTags: updatedSelectedTags,
      sortBy: updatedSortBy,
      sortOrder: updatedSortOrder
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDifficulty('all');
    setSelectedTags([]);
    setSortBy('created_at');
    setSortOrder('desc');
    onFiltersChange({
      searchQuery: '',
      selectedType: 'all',
      selectedDifficulty: 'all',
      selectedTags: [],
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="knowledge-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zoeken
          </label>
          <input
            id="knowledge-search"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              
              // Clear existing timeout
              if (debounceRef.current) {
                clearTimeout(debounceRef.current);
              }
              
              // Set new timeout for debounced search
              debounceRef.current = setTimeout(() => {
                handleFilterChange(value);
              }, 300);
            }}
            placeholder="Zoek in titel, content of tags..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="knowledge-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select
            id="knowledge-type"
            value={selectedType}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedType(value);
              handleFilterChange(undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Alle types</option>
            <option value="article">📄 Artikelen</option>
            <option value="video">🎥 Video's</option>
            <option value="podcast">🎧 Podcasts</option>
            <option value="infographic">📊 Infographics</option>
            <option value="book">📚 Boeken</option>
            <option value="music">🎵 Muziek</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label htmlFor="knowledge-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Niveau
          </label>
          <select
            id="knowledge-level"
            value={selectedDifficulty}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDifficulty(value);
              handleFilterChange(undefined, undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">Alle niveaus</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Gemiddeld</option>
            <option value="advanced">Gevorderd</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="knowledge-sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sorteren op
          </label>
          <select
            id="knowledge-sort"
            value={sortBy}
            onChange={(e) => {
              const value = e.target.value;
              setSortBy(value);
              handleFilterChange(undefined, undefined, undefined, undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="created_at">Datum</option>
            <option value="title">Titel</option>
            <option value="word_count">Woorden</option>
            <option value="difficulty">Moeilijkheid</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="knowledge-order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Volgorde
          </label>
          <select
            id="knowledge-order"
            value={sortOrder}
            onChange={(e) => {
              const value = e.target.value as 'asc' | 'desc';
              setSortOrder(value);
              handleFilterChange(undefined, undefined, undefined, undefined, undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="desc">Nieuwste eerst</option>
            <option value="asc">Oudste eerst</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Filters wissen
          </button>
        </div>
      </div>

      {/* Tags Section */}
      {availableTags.length > 0 && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Populaire Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  const newTags = selectedTags.includes(tag)
                    ? selectedTags.filter(t => t !== tag)
                    : [...selectedTags, tag];
                  setSelectedTags(newTags);
                  handleFilterChange(undefined, undefined, undefined, newTags);
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer border ${
                  selectedTags.includes(tag) 
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
