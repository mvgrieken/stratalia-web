/**
 * Cache service for API routes
 * Provides in-memory caching with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate a cache key from parameters
   */
  generateKey(prefix: string, ...params: (string | number | boolean)[]): string {
    const normalizedParams = params.map(param => 
      typeof param === 'string' ? param.toLowerCase().trim() : String(param)
    );
    return `${prefix}:${normalizedParams.join(':')}`;
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Delete data from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    const keys: string[] = [];
    const values: any[] = [];
    
    this.cache.forEach((entry, key) => {
      keys.push(key);
      values.push(entry);
    });
    
    return {
      size: this.cache.size,
      keys,
      memoryUsage: JSON.stringify(values).length
    };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set pattern - useful for API routes
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Cache key generators for specific use cases
export const cacheKeys = {
  search: (query: string, limit: number) => 
    cacheService.generateKey('search', query, limit),
  
  translate: (text: string, direction: string) => 
    cacheService.generateKey('translate', text, direction),
  
  quiz: (difficulty: string, limit: number) => 
    cacheService.generateKey('quiz', difficulty, limit),
  
  knowledge: (filters: Record<string, any>) => 
    cacheService.generateKey('knowledge', JSON.stringify(filters)),
  
  leaderboard: (limit: number) => 
    cacheService.generateKey('leaderboard', limit),
  
  wordOfTheDay: () => 
    cacheService.generateKey('wordOfTheDay', new Date().toDateString())
};

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,    // 2 minutes
  MEDIUM: 5 * 60 * 1000,   // 5 minutes
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 60 * 60 * 1000 // 1 hour
} as const;

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  cacheService.clearExpired();
}, 5 * 60 * 1000);

export default cacheService;
