'use client';

import React from 'react';

interface ActivityItem {
  id: string;
  type: 'quiz' | 'word_learned' | 'challenge' | 'badge' | 'streak' | 'submission';
  title: string;
  description: string;
  points_earned?: number;
  timestamp: string;
  icon: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export default function RecentActivity({ activities, maxItems = 8, className = '' }: RecentActivityProps) {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quiz':
        return 'bg-blue-50 border-blue-200';
      case 'word_learned':
        return 'bg-green-50 border-green-200';
      case 'challenge':
        return 'bg-purple-50 border-purple-200';
      case 'badge':
        return 'bg-yellow-50 border-yellow-200';
      case 'streak':
        return 'bg-orange-50 border-orange-200';
      case 'submission':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Net geleden';
    } else if (diffInHours < 24) {
      return `${diffInHours} uur geleden`;
    } else if (diffInHours < 48) {
      return 'Gisteren';
    } else {
      return date.toLocaleDateString('nl-NL');
    }
  };

  if (displayActivities.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen activiteit</h3>
          <p className="text-gray-600">
            Begin met leren om je activiteit hier te zien!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recente Activiteit</h2>
      <div className="space-y-4">
        {displayActivities.map((activity) => (
          <div 
            key={activity.id} 
            className={`flex items-center space-x-4 p-4 rounded-lg border ${getActivityColor(activity.type)}`}
          >
            <div className="text-2xl flex-shrink-0">{activity.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{activity.title}</h3>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
            {activity.points_earned && activity.points_earned > 0 && (
              <div className="text-green-600 font-semibold flex-shrink-0">
                +{activity.points_earned} punten
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
