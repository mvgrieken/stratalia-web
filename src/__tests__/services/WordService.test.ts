import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WordService } from '@/services/WordService';
import { mockDataService } from '@/lib/mock-data';
// import { cacheService } from '@/lib/cache';
// import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/lib/mock-data');
vi.mock('@/lib/cache');
vi.mock('@/lib/logger');
vi.mock('@/lib/supabase-client');

describe('WordService', () => {
  let wordService: WordService;

  beforeEach(() => {
    vi.clearAllMocks();
    wordService = new WordService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchWords', () => {
    it('should return search results from database when available', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock successful database response
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: mockResults,
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const results = await wordService.searchWords('skeer', 10);
      
      expect(results).toEqual(mockResults);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('words');
    });

    it('should fallback to mock data when database fails', async () => {
      const mockFallbackResults = [
        {
          id: 'fallback-1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'fallback'
        }
      ];

      // Mock database failure
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
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

      vi.mocked(mockDataService.searchWords).mockResolvedValue(mockFallbackResults);

      const results = await wordService.searchWords('skeer', 10);
      
      expect(results).toEqual(mockFallbackResults);
      expect(mockDataService.searchWords).toHaveBeenCalledWith('skeer', 10);
    });

    it('should handle empty search query', async () => {
      const results = await wordService.searchWords('', 10);
      expect(results).toEqual([]);
    });

    it('should handle null search query', async () => {
      const results = await wordService.searchWords(null as any, 10);
      expect(results).toEqual([]);
    });
  });

  describe('getDailyWord', () => {
    it('should return daily word from database when available', async () => {
      const mockDailyWord = {
        id: '1',
        word: 'skeer',
        meaning: 'arm, weinig geld hebben',
        example: 'Ik ben helemaal skeer deze maand.',
        etymology: 'Afkomstig van het Jiddische woord "sker"',
        audio_url: 'https://example.com/audio.mp3'
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { words: mockDailyWord },
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await wordService.getDailyWord();
      
      expect(result).toEqual(mockDailyWord);
    });

    it('should fallback to mock data when database fails', async () => {
      const mockFallbackWord = {
        id: 'fallback-1',
        word: 'skeer',
        meaning: 'arm, weinig geld hebben',
        example: 'Ik ben helemaal skeer deze maand.',
        etymology: 'Afkomstig van het Jiddische woord "sker"',
        audio_url: 'https://example.com/audio.mp3'
      };

      // Mock database failure
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
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

      vi.mocked(mockDataService.getDailyWord).mockResolvedValue(mockFallbackWord);

      const result = await wordService.getDailyWord();
      
      expect(result).toEqual(mockFallbackWord);
      expect(mockDataService.getDailyWord).toHaveBeenCalled();
    });

    it('should handle array response from database', async () => {
      const mockDailyWord = {
        id: '1',
        word: 'skeer',
        meaning: 'arm, weinig geld hebben',
        example: 'Ik ben helemaal skeer deze maand.',
        etymology: 'Afkomstig van het Jiddische woord "sker"',
        audio_url: 'https://example.com/audio.mp3'
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { words: [mockDailyWord] },
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await wordService.getDailyWord();
      
      expect(result).toEqual(mockDailyWord);
    });
  });

  describe('getWordById', () => {
    it('should return word by ID from database', async () => {
      const mockWord = {
        id: '1',
        word: 'skeer',
        meaning: 'arm, weinig geld hebben',
        example: 'Ik ben helemaal skeer deze maand.',
        etymology: 'Afkomstig van het Jiddische woord "sker"',
        audio_url: 'https://example.com/audio.mp3'
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockWord,
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await wordService.getWordById('1');
      
      expect(result).toEqual(mockWord);
    });

    it('should return null when word not found', async () => {
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116', message: 'No rows found' }
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await wordService.getWordById('nonexistent');
      
      expect(result).toBeNull();
    });
  });

  describe('addWord', () => {
    it('should add word to database successfully', async () => {
      const newWord = {
        word: 'test',
        meaning: 'test meaning',
        example: 'test example',
        etymology: 'test etymology'
      };

      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: '1', ...newWord },
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const result = await wordService.addWord(newWord);
      
      expect(result).toEqual({ id: '1', ...newWord });
    });

    it('should handle database error when adding word', async () => {
      const newWord = {
        word: 'test',
        meaning: 'test meaning',
        example: 'test example',
        etymology: 'test etymology'
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

      await expect(wordService.addWord(newWord)).rejects.toThrow('Database error');
    });
  });
});
