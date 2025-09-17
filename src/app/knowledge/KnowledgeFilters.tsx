'use client';

import { useState, useEffect, useRef } from 'react';

interface KnowledgeFiltersProps {
  onFiltersChange: (filters: {
    searchQuery: string;
    selectedType: string;
    selectedDifficulty: string;
  }) => void;
}

export default function KnowledgeFilters({ onFiltersChange }: KnowledgeFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilterChange = (newSearchQuery?: string, newSelectedType?: string, newSelectedDifficulty?: string) => {
    const updatedSearchQuery = newSearchQuery !== undefined ? newSearchQuery : searchQuery;
    const updatedSelectedType = newSelectedType !== undefined ? newSelectedType : selectedType;
    const updatedSelectedDifficulty = newSelectedDifficulty !== undefined ? newSelectedDifficulty : selectedDifficulty;
    
    onFiltersChange({
      searchQuery: updatedSearchQuery,
      selectedType: updatedSelectedType,
      selectedDifficulty: updatedSelectedDifficulty
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedDifficulty('all');
    onFiltersChange({
      searchQuery: '',
      selectedType: 'all',
      selectedDifficulty: 'all'
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
    <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zoeken
          </label>
          <input
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedType(value);
              handleFilterChange(undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedDifficulty(value);
              handleFilterChange(undefined, undefined, value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle niveaus</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Gemiddeld</option>
            <option value="advanced">Gevorderd</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Filters wissen
          </button>
        </div>
      </div>
    </div>
  );
}
