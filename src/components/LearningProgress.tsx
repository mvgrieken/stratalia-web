'use client';

import React from 'react';

interface ProgressItem {
  category: string;
  words_learned: number;
  total_words: number;
  mastery_percentage: number;
  last_activity: string;
}

interface LearningProgressProps {
  progress: ProgressItem[];
  className?: string;
}

export default function LearningProgress({ progress, className = '' }: LearningProgressProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressLabel = (percentage: number) => {
    if (percentage >= 80) return 'Expert';
    if (percentage >= 60) return 'Gevorderd';
    if (percentage >= 40) return 'Gemiddeld';
    return 'Beginner';
  };

  if (progress.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Leervoortgang</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen voortgang</h3>
          <p className="text-gray-600">
            Begin met leren om je voortgang hier te zien!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Leervoortgang</h2>
      <div className="space-y-4">
        {progress.map((item, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">{item.category}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {item.words_learned}/{item.total_words} woorden
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.mastery_percentage >= 80 ? 'bg-green-100 text-green-800' :
                  item.mastery_percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                  item.mastery_percentage >= 40 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {getProgressLabel(item.mastery_percentage)}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(item.mastery_percentage)}`}
                style={{ width: `${Math.min(item.mastery_percentage, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-medium">{item.mastery_percentage}% beheersing</span>
              <span>
                Laatste activiteit: {new Date(item.last_activity).toLocaleDateString('nl-NL')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
