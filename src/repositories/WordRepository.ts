/**
 * Word Repository - Data access layer for words
 * Implements Repository Pattern for database operations
 */

import { getSupabaseClient } from '@/lib/supabase-client';
import { logger } from '@/lib/logger';

export interface WordEntity {
  id: string;
  word: string;
  definition?: string;
  meaning?: string;
  example?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at?: string;
  updated_at?: string;
}

export interface WordSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface WordListParams {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  orderBy?: 'word' | 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
}

class WordRepository {
  private readonly tableName = 'words';

  /**
   * Search words by query
   */
  async search(params: WordSearchParams): Promise<WordEntity[]> {
    const { query, limit = 10, offset = 0 } = params;
    
    logger.info("Searching words in database");

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at')
        .or(`word.ilike.%${query}%,definition.ilike.%${query}%,meaning.ilike.%${query}%`)
        .range(offset, offset + limit - 1)
        .order('word');

      if (error) {
        logger.error('Database search error', error);
        throw error;
      }

      logger.info("Database search successful");
      return data || [];
    } catch (error) {
      logger.error('Word search failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get word by ID
   */
  async findById(id: string): Promise<WordEntity | null> {
    logger.info("Finding word by ID");

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          logger.info("Word not found");
          return null;
        }
        logger.error('Database findById error', error);
        throw error;
      }

      logger.info("Word found by ID");
      return data;
    } catch (error) {
      logger.error('Word findById failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get all words with pagination and filters
   */
  async findAll(params: WordListParams = {}): Promise<{ words: WordEntity[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      category,
      difficulty,
      orderBy = 'word',
      orderDirection = 'asc'
    } = params;

    const offset = (page - 1) * limit;
    
    logger.info("Finding all words");

    try {
      const supabase = getSupabaseClient();
      
      // Build query
      let query = supabase
        .from(this.tableName)
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at', { count: 'exact' });

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      if (error) {
        logger.error('Database findAll error', error);
        throw error;
      }

      logger.info("Words found");
      return { words: data || [], total: count || 0 };
    } catch (error) {
      logger.error('Word findAll failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get random word
   */
  async findRandom(): Promise<WordEntity | null> {
    logger.info('Finding random word');

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at')
        .limit(1);

      if (error) {
        logger.error('Database findRandom error', error);
        throw error;
      }

      if (!data || data.length === 0) {
        logger.info("No words found for random selection");
        return null;
      }

      // Get random index
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomWord = data[randomIndex];

      logger.info("Random word found: id=" + randomWord.id);
      return randomWord;
    } catch (error) {
      logger.error('Word findRandom failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get daily word
   */
  async findDailyWord(date?: string): Promise<WordEntity | null> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    logger.info("Finding daily word: date=" + targetDate);

    try {
      const supabase = getSupabaseClient();
      
      // First try to get a specific daily word
      const { data: dailyWord, error: dailyError } = await supabase
        .from('word_of_the_day')
        .select(`
          id,
          words (
            id,
            word,
            definition,
            meaning,
            example,
            category,
            difficulty,
            created_at,
            updated_at
          )
        `)
        .eq('date', targetDate)
        .single();

      if (!dailyError && dailyWord?.words) {
        logger.info("Daily word found");
        return dailyWord.words as unknown as WordEntity;
      }

      // If no specific daily word, get a random word
      logger.info('No specific daily word, getting random word');
      return await this.findRandom();
    } catch (error) {
      logger.error('Word findDailyWord failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Create new word
   */
  async create(wordData: Omit<WordEntity, 'id' | 'created_at' | 'updated_at'>): Promise<WordEntity> {
    logger.info("Creating new word");

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([wordData])
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at')
        .single();

      if (error) {
        logger.error('Database create error', error);
        throw error;
      }

      logger.info("Word created successfully");
      return data;
    } catch (error) {
      logger.error('Word create failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Update word
   */
  async update(id: string, wordData: Partial<Omit<WordEntity, 'id' | 'created_at' | 'updated_at'>>): Promise<WordEntity> {
    logger.info("Updating word");

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...wordData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id, word, definition, meaning, example, category, difficulty, created_at, updated_at')
        .single();

      if (error) {
        logger.error('Database update error', error);
        throw error;
      }

      logger.info("Word updated successfully");
      return data;
    } catch (error) {
      logger.error('Word update failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Delete word
   */
  async delete(id: string): Promise<boolean> {
    logger.info("Deleting word");

    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Database delete error', error);
        throw error;
      }

      logger.info("Word deleted successfully");
      return true;
    } catch (error) {
      logger.error('Word delete failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get word count by category
   */
  async getCountByCategory(): Promise<Record<string, number>> {
    logger.info('Getting word count by category');

    try {
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .not('category', 'is', null);

      if (error) {
        logger.error('Database getCountByCategory error', error);
        throw error;
      }

      const counts: Record<string, number> = {};
      data?.forEach(word => {
        const category = word.category || 'uncategorized';
        counts[category] = (counts[category] || 0) + 1;
      });

      logger.info("Word count by category retrieved");
      return counts;
    } catch (error) {
      logger.error('Word getCountByCategory failed', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

// Singleton instance
export const wordRepository = new WordRepository();
