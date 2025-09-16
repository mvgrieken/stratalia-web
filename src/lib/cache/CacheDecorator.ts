/**
 * Cache Decorator
 * Decorator for caching service method results
 */

import { queryCache } from './QueryCache';
import { logger } from '@/lib/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Cache tags for invalidation
  keyGenerator?: (...args: any[]) => string; // Custom key generator
  skipCache?: boolean; // Skip cache for this call
}

/**
 * Cache decorator for service methods
 */
export function Cache(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      // Skip cache if requested
      if (options.skipCache) {
        return method.apply(this, args);
      }

      // Generate cache key
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : queryCache.generateKey(`${className}.${propertyName}`, { args });

      // Try to get from cache
      const cached = queryCache.get(key);
      if (cached !== null) {
        logger.debug(`Cache hit: ${key}`);
        return cached;
      }

      // Execute method and cache result
      try {
        const result = await method.apply(this, args);
        queryCache.set(key, result, options.ttl, options.tags);
        logger.debug(`Cache set: ${key}`);
        return result;
      } catch (error) {
        logger.error(`Method execution failed: ${className}.${propertyName}`, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache invalidation decorator
 */
export function CacheInvalidate(tags: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const className = target.constructor.name;

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await method.apply(this, args);
        
        // Invalidate cache after successful execution
        const invalidated = queryCache.invalidateByTags(tags);
        logger.info(`Cache invalidated: ${invalidated} entries for tags: ${tags.join(', ')}`);
        
        return result;
      } catch (error) {
        logger.error(`Method execution failed: ${className}.${propertyName}`, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Cache key generators for common patterns
 */
export const CacheKeyGenerators = {
  /**
   * Generate key from first argument (usually ID)
   */
  byFirstArg: (...args: any[]) => {
    return queryCache.generateKey('byFirstArg', { id: args[0] });
  },

  /**
   * Generate key from search parameters
   */
  bySearchParams: (...args: any[]) => {
    const [query, limit, offset] = args;
    return queryCache.generateKey('search', { query, limit, offset });
  },

  /**
   * Generate key from user ID and operation
   */
  byUserAndOperation: (...args: any[]) => {
    const [userId, operation, ...rest] = args;
    return queryCache.generateKey('userOperation', { userId, operation, params: rest });
  },

  /**
   * Generate key from date range
   */
  byDateRange: (...args: any[]) => {
    const [startDate, endDate, ...rest] = args;
    return queryCache.generateKey('dateRange', { startDate, endDate, params: rest });
  },
};

/**
 * Cache tags for common entities
 */
export const CacheTags = {
  WORDS: 'words',
  QUIZ_QUESTIONS: 'quiz_questions',
  USER_PROFILES: 'user_profiles',
  LEADERBOARD: 'leaderboard',
  KNOWLEDGE_ITEMS: 'knowledge_items',
  COMMUNITY_SUBMISSIONS: 'community_submissions',
  NOTIFICATIONS: 'notifications',
  DAILY_WORDS: 'daily_words',
  QUIZ_RESULTS: 'quiz_results',
  USER_PROGRESS: 'user_progress',
} as const;

export default Cache;
