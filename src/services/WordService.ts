/**
 * Word Service - Business logic for word operations
 * Implements Service Layer pattern for better separation of concerns
 */

import { wordRepository } from '@/repositories/WordRepository';
import { mockDataService } from '@/lib/mock-data';
import { cacheService } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase-client';
import { AppError, Errors } from '@/lib/errors';
import { BaseService } from './BaseService';

export interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type: 'exact' | 'partial' | 'fallback';
  similarity_score: number;
}

export interface DailyWordResponse {
  word: Word;
  source: 'database' | 'fallback';
  date: string;
}

class WordService extends BaseService {
  constructor() {
    super('WordService', {
      timeout: 15000, // 15 seconds for word operations
      retries: 2,
      retryDelay: 500,
    });
  }
  /**
   * Search for words in the database
   */
  async searchWords(query: string, limit: number = 10): Promise<SearchResult[]> {
    return this.handleRequest(
      async () => {
        this.validateRequired({ query }, ['query']);
        const searchQuery = this.sanitizeInput(query).toLowerCase();
    
        // Check cache first
        const cacheKey = cacheService.generateKey('search', { query: searchQuery, limit });
        const cachedResult = cacheService.get<SearchResult[]>(cacheKey);
        
        if (cachedResult) {
          return cachedResult;
        }

        // Try database search first
        try {
          const words = await wordRepository.search({ query: searchQuery, limit });
          
          if (words && words.length > 0) {
            const results = words.map(word => ({
              id: word.id,
              word: word.word,
              meaning: word.definition || '',
              example: word.example || '',
              match_type: word.word.toLowerCase() === searchQuery ? 'exact' as const : 'partial' as const,
              similarity_score: word.word.toLowerCase() === searchQuery ? 1.0 : 0.8
            }));

            // Cache the result for 5 minutes
            cacheService.set(cacheKey, results, 5 * 60 * 1000);
            
            return results;
          }
        } catch (dbError) {
          logger.warn(`Database search failed, using fallback: error=${dbError}`);
        }

        // Fallback to mock data
        const mockWords = mockDataService.searchWords(searchQuery, limit);
        const results = mockWords.map(word => ({
          id: word.id,
          word: word.word,
          meaning: word.meaning,
          example: word.example,
          match_type: word.word.toLowerCase() === searchQuery ? 'exact' as const : 'partial' as const,
          similarity_score: word.word.toLowerCase() === searchQuery ? 1.0 : 0.8
        }));

        // Cache fallback results for shorter time (1 minute)
        cacheService.set(cacheKey, results, 1 * 60 * 1000);

        return results;
      },
      'searchWords',
      { query, limit }
    );
  }

  /**
   * Get a random word for daily word feature
   */
  async getDailyWord(): Promise<DailyWordResponse> {
    logger.info('Fetching daily word');

    // Try database first
    try {
      const supabase = getSupabaseClient();
      
      // First try to get a specific "word of the day"
      const { data: dailyWord, error: dailyError } = await supabase
        .from('word_of_the_day')
        .select(`
          id,
          words (
            id,
            word,
            definition,
            example,
            meaning
          )
        `)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (!dailyError && dailyWord?.words) {
        const word = Array.isArray(dailyWord.words) ? dailyWord.words[0] : dailyWord.words;
        logger.info('Daily word found in database');
        return {
          word: {
            id: word.id,
            word: word.word,
            meaning: word.definition || word.meaning || '',
            example: word.example || '',
          },
          source: 'database',
          date: new Date().toISOString().split('T')[0]
        };
      }

      // If no specific daily word, get a random word
      const { data: randomWords, error: randomError } = await supabase
        .from('words')
        .select('id, word, definition, example, meaning')
        .limit(1);

      if (!randomError && randomWords && randomWords.length > 0) {
        const word = randomWords[0];
        logger.info('Random word found in database');
        return {
          word: {
            id: word.id,
            word: word.word,
            meaning: word.definition || word.meaning || '',
            example: word.example || '',
          },
          source: 'database',
          date: new Date().toISOString().split('T')[0]
        };
      }
    } catch (dbError) {
      logger.warn(`Database daily word fetch failed, using fallback: error=${dbError}`);
    }

    // Fallback to mock data
    const mockWord = mockDataService.getDailyWord();
    logger.info('Using fallback daily word');
    return {
      word: {
        id: mockWord.id,
        word: mockWord.word,
        meaning: mockWord.meaning,
        example: mockWord.example,
        category: mockWord.category,
        difficulty: mockWord.difficulty,
      },
      source: 'fallback',
      date: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Get word by ID
   */
  async getWordById(id: string): Promise<Word | null> {
    if (!id) {
      throw new AppError(
        Errors.VALIDATION_ERROR.code,
        'Word ID is required',
        Errors.VALIDATION_ERROR.statusCode
      );
    }

    logger.info(`Fetching word by ID: id=undefined`);

    // Try database first
    try {
      const supabase = getSupabaseClient();
      
      const { data: word, error } = await supabase
        .from('words')
        .select('id, word, definition, example, meaning')
        .eq('id', id)
        .single();

      if (!error && word) {
        logger.info(`Word found in database: id=undefined`);
        return {
          id: word.id,
          word: word.word,
          meaning: word.definition || word.meaning || '',
          example: word.example || '',
        };
      }
    } catch (dbError) {
      logger.warn(`Database word fetch failed, trying fallback: error=${dbError}`);
    }

    // Fallback to mock data
    const mockWord = mockDataService.getWordById(id);
    if (mockWord) {
      logger.info(`Word found in fallback data: id=undefined`);
      return {
        id: mockWord.id,
        word: mockWord.word,
        meaning: mockWord.meaning,
        example: mockWord.example,
        category: mockWord.category,
        difficulty: mockWord.difficulty,
      };
    }

    logger.warn(`Word not found: id=undefined`);
    return null;
  }

  /**
   * Get all words with pagination
   */
  async getAllWords(page: number = 1, limit: number = 20): Promise<{ words: Word[]; total: number }> {
    logger.info(`Fetching all words: page=undefined, limit=undefined`);

    // Try database first
    try {
      const supabase = getSupabaseClient();
      const offset = (page - 1) * limit;
      
      const { data: words, error } = await supabase
        .from('words')
        .select('id, word, definition, example, meaning')
        .range(offset, offset + limit - 1)
        .order('word');

      const { count, error: countError } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true });

      if (!error && !countError && words) {
        const result = words.map(word => ({
          id: word.id,
          word: word.word,
          meaning: word.definition || word.meaning || '',
          example: word.example || '',
        }));

        logger.info(`Words fetched from database: count=result.length, total=count`);
        return { words: result, total: count || 0 };
      }
    } catch (dbError) {
      logger.warn(`Database words fetch failed, using fallback: error=${dbError}`);
    }

    // Fallback to mock data
    const allMockWords = mockDataService.getWords();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const words = allMockWords.slice(startIndex, endIndex).map(word => ({
      id: word.id,
      word: word.word,
      meaning: word.meaning,
      example: word.example,
      category: word.category,
      difficulty: word.difficulty,
    }));

    logger.info(`Words fetched from fallback: count=words.length, total=allMockWords.length`);
    return { words, total: allMockWords.length };
  }
}

// Singleton instance
export const wordService = new WordService();
