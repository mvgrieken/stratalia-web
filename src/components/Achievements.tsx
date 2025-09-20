'use client';

import React from 'react';

interface Achievement {
  name: string;
  icon: string;
  earned_at: string;
  description?: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  maxItems?: number;
  className?: string;
}

export default function Achievements({ achievements, maxItems = 6, className = '' }: AchievementsProps) {
  const displayAchievements = achievements.slice(0, maxItems);

  const getAchievementGradient = (index: number) => {
    const gradients = [
      'from-yellow-50 to-orange-50 border-yellow-200',
      'from-blue-50 to-indigo-50 border-blue-200',
      'from-green-50 to-emerald-50 border-green-200',
      'from-purple-50 to-pink-50 border-purple-200',
      'from-red-50 to-rose-50 border-red-200',
      'from-teal-50 to-cyan-50 border-teal-200'
    ];
    return gradients[index % gradients.length];
  };

  if (displayAchievements.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🏅 Recente Achievements</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen achievements</h3>
          <p className="text-gray-600">
            Begin met leren om je eerste achievement te verdienen!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🏅 Recente Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAchievements.map((achievement, index) => (
          <div 
            key={index} 
            className={`p-4 bg-gradient-to-r rounded-lg border ${getAchievementGradient(index)} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-3xl flex-shrink-0">{achievement.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{achievement.name}</h3>
                {achievement.description && (
                  <p className="text-sm text-gray-600 truncate">{achievement.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Verdiend op {new Date(achievement.earned_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
