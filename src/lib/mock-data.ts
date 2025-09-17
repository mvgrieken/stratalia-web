/**
 * Centralized mock data service
 * Provides fallback data for development and testing
 * 
 * This file now acts as a central hub that imports from specialized modules
 */

// Re-export types and data from specialized modules
export type { MockWord } from '@/data/mock-words';
export type { MockQuizQuestion } from '@/data/mock-quiz';
export type { MockKnowledgeItem } from '@/data/mock-knowledge';

// Re-export service functions
export {
  searchWords,
  getWordById,
  getWordsByCategory,
  getWordsByDifficulty,
  getRandomWords,
  getWordOfTheDay,
  getWords
} from '@/data/mock-words';

export {
  getQuizQuestions,
  getQuizQuestionById,
  getRandomQuizQuestion,
  getQuizQuestionsByWord,
  getQuizQuestionsByDifficulty,
  getQuizStats
} from '@/data/mock-quiz';

export {
  getKnowledgeItems,
  getKnowledgeItemById,
  searchKnowledgeItems,
  getKnowledgeItemsByCategory,
  getKnowledgeItemsByType,
  getKnowledgeItemsByDifficulty,
  getKnowledgeStats,
  getRandomKnowledgeItems
} from '@/data/mock-knowledge';

// Leaderboard data (kept here as it's not large enough to warrant its own module)
export interface MockLeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  avatar_url?: string;
}

export const mockLeaderboardUsers: MockLeaderboardUser[] = [
    {
      rank: 1,
    user_id: 'user-1',
    full_name: 'Ahmed Hassan',
      total_points: 2450,
    current_level: 12,
    current_streak: 15,
    longest_streak: 23,
    avatar_url: '/avatars/ahmed.jpg'
    },
    {
      rank: 2,
    user_id: 'user-2',
    full_name: 'Sofia Rodriguez',
    total_points: 2380,
    current_level: 11,
      current_streak: 8,
      longest_streak: 18,
      avatar_url: '/avatars/sofia.jpg'
    },
    {
      rank: 3,
    user_id: 'user-3',
    full_name: 'Mohammed Ali',
    total_points: 2290,
    current_level: 11,
    current_streak: 12,
    longest_streak: 20,
      avatar_url: '/avatars/mohammed.jpg'
    },
    {
      rank: 4,
    user_id: 'user-4',
    full_name: 'Emma van der Berg',
    total_points: 2150,
    current_level: 10,
      current_streak: 5,
    longest_streak: 16,
      avatar_url: '/avatars/emma.jpg'
    },
    {
      rank: 5,
    user_id: 'user-5',
    full_name: 'Yusuf Demir',
    total_points: 2080,
    current_level: 10,
    current_streak: 20,
    longest_streak: 25,
    avatar_url: '/avatars/yusuf.jpg'
    },
    {
      rank: 6,
    user_id: 'user-6',
    full_name: 'Layla Johnson',
    total_points: 1950,
    current_level: 9,
    current_streak: 3,
    longest_streak: 14,
    avatar_url: '/avatars/layla.jpg'
    },
    {
      rank: 7,
    user_id: 'user-7',
    full_name: 'Omar El-Mansouri',
    total_points: 1820,
    current_level: 9,
    current_streak: 7,
    longest_streak: 12,
    avatar_url: '/avatars/omar.jpg'
    },
    {
      rank: 8,
    user_id: 'user-8',
    full_name: 'Aisha Bakker',
    total_points: 1750,
    current_level: 8,
    current_streak: 10,
    longest_streak: 15,
    avatar_url: '/avatars/aisha.jpg'
    },
    {
      rank: 9,
    user_id: 'user-9',
    full_name: 'Hassan van Dijk',
    total_points: 1680,
    current_level: 8,
      current_streak: 4,
    longest_streak: 11,
    avatar_url: '/avatars/hassan.jpg'
    },
    {
      rank: 10,
    user_id: 'user-10',
    full_name: 'Fatima de Vries',
    total_points: 1620,
    current_level: 8,
    current_streak: 6,
    longest_streak: 13,
    avatar_url: '/avatars/fatima.jpg'
  }
];

// Leaderboard service functions
export function getLeaderboardUsers(limit: number = 10): MockLeaderboardUser[] {
  return mockLeaderboardUsers.slice(0, limit);
}

export function getLeaderboardUserById(userId: string): MockLeaderboardUser | undefined {
  return mockLeaderboardUsers.find(user => user.user_id === userId);
}

export function getLeaderboardUserByRank(rank: number): MockLeaderboardUser | undefined {
  return mockLeaderboardUsers.find(user => user.rank === rank);
}

export function getTopUsers(count: number = 5): MockLeaderboardUser[] {
  return mockLeaderboardUsers.slice(0, count);
}

export function getLeaderboardStats(): {
  totalUsers: number;
  averagePoints: number;
  highestStreak: number;
  totalPoints: number;
} {
  const totalUsers = mockLeaderboardUsers.length;
  const totalPoints = mockLeaderboardUsers.reduce((sum, user) => sum + user.total_points, 0);
  const averagePoints = totalPoints / totalUsers;
  const highestStreak = Math.max(...mockLeaderboardUsers.map(user => user.longest_streak));
  
  return {
    totalUsers,
    averagePoints: Math.round(averagePoints),
    highestStreak,
    totalPoints
  };
}

// Translation service functions (re-exported from translations.ts)
export {
  getTranslationMap,
  getReverseTranslationMap,
  findTranslation
} from '@/data/translations';

// Import functions directly for the mockDataService object
import * as wordFunctions from '@/data/mock-words';
import * as quizFunctions from '@/data/mock-quiz';
import * as knowledgeFunctions from '@/data/mock-knowledge';
import * as translationFunctions from '@/data/translations';

// Backward compatibility - create mockDataService object
export const mockDataService = {
  // Words
  searchWords: wordFunctions.searchWords,
  getWordById: wordFunctions.getWordById,
  getWordsByCategory: wordFunctions.getWordsByCategory,
  getWordsByDifficulty: wordFunctions.getWordsByDifficulty,
  getRandomWords: wordFunctions.getRandomWords,
  getWordOfTheDay: wordFunctions.getWordOfTheDay,
  getWords: wordFunctions.getWords,
  
  // Quiz
  getQuizQuestions: quizFunctions.getQuizQuestions,
  getQuizQuestionById: quizFunctions.getQuizQuestionById,
  getRandomQuizQuestion: quizFunctions.getRandomQuizQuestion,
  getQuizQuestionsByWord: quizFunctions.getQuizQuestionsByWord,
  getQuizQuestionsByDifficulty: quizFunctions.getQuizQuestionsByDifficulty,
  getQuizStats: quizFunctions.getQuizStats,
  
  // Knowledge
  getKnowledgeItems: knowledgeFunctions.getKnowledgeItems,
  getKnowledgeItemById: knowledgeFunctions.getKnowledgeItemById,
  searchKnowledgeItems: knowledgeFunctions.searchKnowledgeItems,
  getKnowledgeItemsByCategory: knowledgeFunctions.getKnowledgeItemsByCategory,
  getKnowledgeItemsByType: knowledgeFunctions.getKnowledgeItemsByType,
  getKnowledgeItemsByDifficulty: knowledgeFunctions.getKnowledgeItemsByDifficulty,
  getKnowledgeStats: knowledgeFunctions.getKnowledgeStats,
  getRandomKnowledgeItems: knowledgeFunctions.getRandomKnowledgeItems,
  
  // Leaderboard
  getLeaderboardUsers: getLeaderboardUsers,
  getLeaderboardUserById: getLeaderboardUserById,
  getLeaderboardUserByRank: getLeaderboardUserByRank,
  getTopUsers: getTopUsers,
  getLeaderboardStats: getLeaderboardStats,
  
  // Translations
  getTranslationMap: translationFunctions.getTranslationMap,
  getReverseTranslationMap: translationFunctions.getReverseTranslationMap,
  findTranslation: translationFunctions.findTranslation
};