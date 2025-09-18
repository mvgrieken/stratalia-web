/**
 * Simple in-memory cache service
 * For production, consider Redis or similar
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in the cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
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
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: Array<{
      key: string;
      age: number;
      expiresIn: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.createdAt,
      expiresIn: entry.expiresAt - now
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Generate cache key for API requests
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return `${prefix}:${sortedParams}`;
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Auto-cleanup every 10 minutes
setInterval(() => {
  const cleaned = cacheService.cleanup();
  if (cleaned > 0) {
    logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
  }
}, 10 * 60 * 1000);
