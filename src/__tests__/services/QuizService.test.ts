import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QuizService } from '@/services/QuizService';
import { mockDataService } from '@/lib/mock-data';
import { cacheService } from '@/lib/cache';
import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/mock-data');
vi.mock('@/lib/cache');
vi.mock('@/lib/logger');
vi.mock('@/lib/supabase-client');

describe('QuizService', () => {
  let quizService: QuizService;

  beforeEach(() => {
    vi.clearAllMocks();
    quizService = new QuizService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getQuizQuestions', () => {
    it('should return quiz questions from database when available', async () => {
      const mockQuestions = [
        {
          id: '1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'geld', 'duur'],
          difficulty: 'easy' as const
        }
      ];

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockQuestions,
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const results = await quizService.getQuizQuestions('easy', 5);
      
      expect(results).toEqual(mockQuestions);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('quiz_questions');
    });

    it('should fallback to mock data when database fails', async () => {
      const mockFallbackQuestions = [
        {
          id: 'fallback-1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'geld', 'duur'],
          difficulty: 'easy' as const
        }
      ];

      // Mock database failure
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Database connection failed')
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      vi.mocked(mockDataService.quizQuestions).mockReturnValue(mockFallbackQuestions);

      const results = await quizService.getQuizQuestions('easy', 5);
      
      expect(results).toEqual(mockFallbackQuestions);
    });

    it('should use default parameters when not provided', async () => {
      const mockQuestions = [
        {
          id: '1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'geld', 'duur'],
          difficulty: 'medium' as const
        }
      ];

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockQuestions,
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const results = await quizService.getQuizQuestions();
      
      expect(results).toEqual(mockQuestions);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('quiz_questions');
    });
  });

  describe('saveQuizResult', () => {
    it('should save quiz result to database successfully', async () => {
      const quizResult = {
        userId: 'user-1',
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        timeTaken: 120000,
        difficulty: 'medium' as const
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: '1', ...quizResult },
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await quizService.saveQuizResult(quizResult);
      
      expect(result).toEqual({ id: '1', ...quizResult });
    });

    it('should handle database error when saving quiz result', async () => {
      const quizResult = {
        userId: 'user-1',
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        timeTaken: 120000,
        difficulty: 'medium' as const
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error')
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      await expect(quizService.saveQuizResult(quizResult)).rejects.toThrow('Database error');
    });
  });

  describe('getQuizStats', () => {
    it('should return quiz stats from database when available', async () => {
      const mockStats = {
        totalQuestions: 100,
        questionsByDifficulty: {
          easy: 40,
          medium: 35,
          hard: 25
        },
        averageScore: 75.5
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            count: vi.fn().mockResolvedValue({
              data: [{ count: 100 }],
              error: null
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      // Mock cache to return stats
      vi.mocked(cacheService.get).mockReturnValue(mockStats);

      const result = await quizService.getQuizStats();
      
      expect(result).toEqual(mockStats);
    });

    it('should fallback to mock data when database fails', async () => {
      const mockFallbackStats = {
        totalQuestions: 50,
        questionsByDifficulty: {
          easy: 20,
          medium: 20,
          hard: 10
        }
      };

      // Mock database failure
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            count: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database connection failed')
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      // Mock cache to return null (cache miss)
      vi.mocked(cacheService.get).mockReturnValue(null);

      const result = await quizService.getQuizStats();
      
      expect(result).toEqual(mockFallbackStats);
    });
  });

  describe('getUserQuizHistory', () => {
    it('should return user quiz history from database', async () => {
      const mockHistory = [
        {
          id: '1',
          userId: 'user-1',
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          timeTaken: 120000,
          difficulty: 'medium',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: mockHistory,
                  error: null
                })
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await quizService.getUserQuizHistory('user-1', 10);
      
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array when no history found', async () => {
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await quizService.getUserQuizHistory('user-1', 10);
      
      expect(result).toEqual([]);
    });
  });
});
