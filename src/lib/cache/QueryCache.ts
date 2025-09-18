/**
 * Query Cache
 * Advanced caching system for database query results
 */

import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { AppError, Errors } from '@/lib/errors';

export interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

export interface CacheEntry<T> {
  key: string;
  value: T;
  createdAt: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: string;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export class QueryCache {
  private static instance: QueryCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
  };
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor(config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    cleanupInterval: 60 * 1000, // 1 minute
  }) {
    this.config = config;
    this.startCleanupTimer();
  }

  public static getInstance(config?: CacheConfig): QueryCache {
    if (!QueryCache.instance) {
      QueryCache.instance = new QueryCache(config);
    }
    return QueryCache.instance;
  }

  /**
   * Get value from cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  public set<T>(
    key: string,
    value: T,
    ttl?: number,
    tags: string[] = []
  ): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      accessCount: 0,
      lastAccessed: now,
      tags,
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, entry);
  }

  /**
   * Get or set pattern
   */
  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    tags: string[] = []
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetcher();
      this.set(key, value, ttl, tags);
      return value;
    } catch (error) {
      logger.error(`Cache fetcher failed for key: ${key} ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Invalidate cache by key
   */
  public invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate cache by tags
   */
  public invalidateByTags(tags: string[]): number {
    let invalidated = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    // Calculate memory usage (rough estimate)
    const memoryUsage = this.estimateMemoryUsage();
    
    // Find oldest and newest entries
    const timestamps = entries.map(e => e.createdAt);
    const oldestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const newestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      memoryUsage,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Generate cache key from query and parameters
   */
  public generateKey(operation: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|');
    
    return `${operation}:${sortedParams}`;
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): string {
    const entries = Array.from(this.cache.values());
    let totalSize = 0;
    
    for (const entry of entries) {
      // Rough estimate: key + value + metadata
      totalSize += entry.key.length * 2; // UTF-16
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 100; // Metadata overhead
    }
    
    if (totalSize < 1024) {
      return `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      return `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  /**
   * Destroy cache instance
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

export const queryCache = QueryCache.getInstance();
export default queryCache;
