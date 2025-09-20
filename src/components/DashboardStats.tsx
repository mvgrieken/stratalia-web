'use client';

import React from 'react';

interface DashboardStatsProps {
  stats: {
    total_points: number;
    level: number;
    current_streak: number;
    longest_streak: number;
    words_learned: number;
    quiz_completed: number;
    average_quiz_score: number;
    challenges_completed: number;
    submissions_count: number;
    approved_submissions: number;
    total_submission_points: number;
    total_submission_likes: number;
    total_challenge_points: number;
    rank: number;
    total_users: number;
  };
  showExtended?: boolean;
  className?: string;
}

export default function DashboardStats({ stats, showExtended = true, className = '' }: DashboardStatsProps) {
  const primaryStats = [
    {
      icon: '🏆',
      title: 'Punten',
      value: stats.total_points.toLocaleString(),
      subtitle: 'Totaal verdiend',
      color: 'text-blue-600'
    },
    {
      icon: '📈',
      title: 'Level',
      value: stats.level.toString(),
      subtitle: 'Huidig niveau',
      color: 'text-green-600'
    },
    {
      icon: '🔥',
      title: 'Streak',
      value: stats.current_streak.toString(),
      subtitle: 'Dagen op rij',
      color: 'text-orange-600'
    },
    {
      icon: '📚',
      title: 'Woorden',
      value: stats.words_learned.toString(),
      subtitle: 'Geleerd',
      color: 'text-purple-600'
    }
  ];

  const extendedStats = [
    {
      icon: '🧠',
      title: 'Quiz Score',
      value: `${stats.average_quiz_score}%`,
      subtitle: 'Gemiddelde score',
      color: 'text-indigo-600'
    },
    {
      icon: '👥',
      title: 'Inzendingen',
      value: stats.approved_submissions.toString(),
      subtitle: 'Goedgekeurd',
      color: 'text-teal-600'
    },
    {
      icon: '🎯',
      title: 'Challenges',
      value: stats.challenges_completed.toString(),
      subtitle: 'Voltooid',
      color: 'text-pink-600'
    },
    {
      icon: '🏅',
      title: 'Ranking',
      value: `#${stats.rank}`,
      subtitle: `van ${stats.total_users}`,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{stat.title}</h3>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Extended Stats */}
      {showExtended && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {extendedStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{stat.title}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
