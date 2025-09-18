/**
 * Index Manager
 * Manages database indexes for performance optimization
 */

import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { AppError, Errors } from '@/lib/errors';

export interface IndexInfo {
  name: string;
  table: string;
  columns: string[];
  type: 'btree' | 'gin' | 'gist' | 'hash';
  isUnique: boolean;
  isPartial: boolean;
  condition?: string;
  comment?: string;
}

export interface IndexStats {
  name: string;
  table: string;
  size: string;
  usage: number;
  lastUsed?: Date;
  efficiency: number;
}

export class IndexManager {
  private static instance: IndexManager;
  private indexes: Map<string, IndexInfo> = new Map();

  private constructor() {
    this.initializeIndexes();
  }

  public static getInstance(): IndexManager {
    if (!IndexManager.instance) {
      IndexManager.instance = new IndexManager();
    }
    return IndexManager.instance;
  }

  /**
   * Initialize predefined indexes
   */
  private initializeIndexes(): void {
    const predefinedIndexes: IndexInfo[] = [
      {
        name: 'idx_words_search',
        table: 'words',
        columns: ['LOWER(word)', 'category', 'difficulty'],
        type: 'btree',
        isUnique: false,
        isPartial: false,
        comment: 'Composite index for word search queries - most frequently used',
      },
      {
        name: 'idx_knowledge_items_approved',
        table: 'knowledge_items',
        columns: ['status', 'created_at'],
        type: 'btree',
        isUnique: false,
        isPartial: true,
        condition: "status = 'approved'",
        comment: 'Partial index for approved content queries',
      },
      {
        name: 'idx_quiz_questions_active_difficulty',
        table: 'quiz_questions',
        columns: ['active', 'difficulty'],
        type: 'btree',
        isUnique: false,
        isPartial: true,
        condition: 'active = true',
        comment: 'Partial index for active quiz questions by difficulty',
      },
      {
        name: 'idx_user_profiles_leaderboard',
        table: 'user_profiles',
        columns: ['total_points DESC', 'level DESC', 'current_streak DESC'],
        type: 'btree',
        isUnique: false,
        isPartial: false,
        comment: 'Composite index for leaderboard queries ordered by points, level, and streak',
      },
      {
        name: 'idx_words_fulltext',
        table: 'words',
        columns: ["to_tsvector('dutch', word || ' ' || COALESCE(definition, '') || ' ' || COALESCE(example, ''))"],
        type: 'gin',
        isUnique: false,
        isPartial: false,
        comment: 'Full-text search index for Dutch language word search',
      },
    ];

    predefinedIndexes.forEach(index => {
      this.indexes.set(index.name, index);
    });
  }

  /**
   * Get all indexes
   */
  public getAllIndexes(): IndexInfo[] {
    return Array.from(this.indexes.values());
  }

  /**
   * Get index by name
   */
  public getIndex(name: string): IndexInfo | undefined {
    return this.indexes.get(name);
  }

  /**
   * Get indexes for a specific table
   */
  public getIndexesForTable(table: string): IndexInfo[] {
    return Array.from(this.indexes.values()).filter(index => index.table === table);
  }

  /**
   * Analyze index usage and performance
   */
  public async analyzeIndexPerformance(): Promise<IndexStats[]> {
    try {
      logger.info('Analyzing index performance');
      
      // In a real implementation, this would query the database for index statistics
      // For now, we'll return mock data
      const stats: IndexStats[] = [
        {
          name: 'idx_words_search',
          table: 'words',
          size: '2.5 MB',
          usage: 95,
          lastUsed: new Date(),
          efficiency: 0.98,
        },
        {
          name: 'idx_knowledge_items_approved',
          table: 'knowledge_items',
          size: '1.2 MB',
          usage: 78,
          lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
          efficiency: 0.92,
        },
        {
          name: 'idx_quiz_questions_active_difficulty',
          table: 'quiz_questions',
          size: '0.8 MB',
          usage: 65,
          lastUsed: new Date(Date.now() - 7200000), // 2 hours ago
          efficiency: 0.88,
        },
        {
          name: 'idx_user_profiles_leaderboard',
          table: 'user_profiles',
          size: '3.1 MB',
          usage: 45,
          lastUsed: new Date(Date.now() - 1800000), // 30 minutes ago
          efficiency: 0.95,
        },
        {
          name: 'idx_words_fulltext',
          table: 'words',
          size: '5.2 MB',
          usage: 32,
          lastUsed: new Date(Date.now() - 10800000), // 3 hours ago
          efficiency: 0.85,
        },
      ];

      return stats;
    } catch (error) {
      logger.error(`Failed to analyze index performance ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        'Failed to analyze index performance',
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Get unused indexes that could be dropped
   */
  public async getUnusedIndexes(): Promise<IndexStats[]> {
    try {
      const stats = await this.analyzeIndexPerformance();
      return stats.filter(stat => stat.usage < 10); // Less than 10% usage
    } catch (error) {
      logger.error(`Failed to get unused indexes ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        'Failed to get unused indexes',
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Get inefficient indexes that need optimization
   */
  public async getInefficientIndexes(): Promise<IndexStats[]> {
    try {
      const stats = await this.analyzeIndexPerformance();
      return stats.filter(stat => stat.efficiency < 0.8); // Less than 80% efficiency
    } catch (error) {
      logger.error(`Failed to get inefficient indexes ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        'Failed to get inefficient indexes',
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Generate index optimization recommendations
   */
  public async getOptimizationRecommendations(): Promise<{
    unused: IndexStats[];
    inefficient: IndexStats[];
    missing: string[];
  }> {
    try {
      const unused = await this.getUnusedIndexes();
      const inefficient = await this.getInefficientIndexes();
      
      // In a real implementation, this would analyze query patterns to suggest missing indexes
      const missing = [
        'idx_user_activity_recent',
        'idx_quiz_results_user_date',
        'idx_notifications_user_unread',
      ];

      return { unused, inefficient, missing };
    } catch (error) {
      logger.error(`Failed to get optimization recommendations ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        'Failed to get optimization recommendations',
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Create a new index
   */
  public async createIndex(index: IndexInfo): Promise<void> {
    try {
      logger.info(`Creating index: ${index.name}`);
      
      // In a real implementation, this would execute the CREATE INDEX statement
      // For now, we'll just add it to our registry
      this.indexes.set(index.name, index);
      
      logger.info(`Index created successfully: ${index.name}`);
    } catch (error) {
      logger.error(`Failed to create index: ${index.name} ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        `Failed to create index: ${index.name}`,
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Drop an index
   */
  public async dropIndex(indexName: string): Promise<void> {
    try {
      logger.info(`Dropping index: ${indexName}`);
      
      // In a real implementation, this would execute the DROP INDEX statement
      // For now, we'll just remove it from our registry
      this.indexes.delete(indexName);
      
      logger.info(`Index dropped successfully: ${indexName}`);
    } catch (error) {
      logger.error(`Failed to drop index: ${indexName} ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        `Failed to drop index: ${indexName}`,
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Rebuild an index
   */
  public async rebuildIndex(indexName: string): Promise<void> {
    try {
      logger.info(`Rebuilding index: ${indexName}`);
      
      // In a real implementation, this would execute REINDEX
      // For now, we'll just log the action
      
      logger.info(`Index rebuilt successfully: ${indexName}`);
    } catch (error) {
      logger.error(`Failed to rebuild index: ${indexName} ${error instanceof Error ? error.message : String(error)}`);
      throw new AppError(
        Errors.DATABASE_ERROR.code,
        `Failed to rebuild index: ${indexName}`,
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }
}

export const indexManager = IndexManager.getInstance();
export default indexManager;
