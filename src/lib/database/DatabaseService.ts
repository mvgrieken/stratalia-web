/**
 * Database Service
 * Centralized database operations with transaction support
 */

import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { AppError, Errors } from '@/lib/errors';
import { transactionManager, TransactionContext } from './TransactionManager';

export interface DatabaseConfig {
  maxConnections?: number;
  connectionTimeout?: number;
  queryTimeout?: number;
}

export interface QueryOptions {
  timeout?: number;
  retries?: number;
  useTransaction?: boolean;
}

export class DatabaseService {
  private static instance: DatabaseService;
  private config: DatabaseConfig;

  private constructor(config: DatabaseConfig = {}) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      queryTimeout: 15000,
      ...config,
    };
  }

  public static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  /**
   * Execute a query with automatic transaction management
   */
  public async executeQuery<T>(
    query: string,
    params: any[] = [],
    options: QueryOptions = {}
  ): Promise<T> {
    const {
      timeout = this.config.queryTimeout,
      retries = 3,
      useTransaction = false,
    } = options;

    if (useTransaction) {
      return transactionManager.executeInTransaction(
        async (context: TransactionContext) => {
          return this.executeQueryInternal<T>(query, params, timeout || this.config.queryTimeout!, context);
        },
        { timeout: timeout || this.config.queryTimeout, retries }
      );
    }

    return this.executeQueryInternal<T>(query, params, timeout || this.config.queryTimeout!);
  }

  /**
   * Execute multiple queries in a single transaction
   */
  public async executeTransaction<T>(
    operations: Array<{
      query: string;
      params?: any[];
      timeout?: number;
    }>
  ): Promise<T[]> {
    return transactionManager.executeInTransaction(
      async (context: TransactionContext) => {
        const results: T[] = [];

        for (const operation of operations) {
          const result = await this.executeQueryInternal<T>(
            operation.query,
            operation.params || [],
            operation.timeout || this.config.queryTimeout!,
            context
          );
          results.push(result);
        }

        return results;
      },
      { timeout: this.config.queryTimeout! * operations.length }
    );
  }

  /**
   * Internal query execution
   */
  private async executeQueryInternal<T>(
    query: string,
    params: any[],
    timeout: number,
    context?: TransactionContext
  ): Promise<T> {
    const startTime = Date.now();
    const queryId = this.generateQueryId();

    try {
      logger.info(`Executing query: ${queryId}`);

      // In a real implementation, this would execute the actual database query
      // For now, we'll simulate the execution
      const result = await this.simulateQueryExecution<T>(query, params, timeout);

      const duration = Date.now() - startTime;
      logger.info(`Query completed: ${queryId}`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const normalizedError = normalizeError(error);
      
      logger.error(`Query failed: ${queryId} ${error instanceof Error ? error.message : String(error)}`);

      throw new AppError(
        Errors.DATABASE_ERROR.code,
        `Database query failed: ${normalizedError.message}`,
        Errors.DATABASE_ERROR.statusCode
      );
    }
  }

  /**
   * Simulate query execution (replace with actual database implementation)
   */
  private async simulateQueryExecution<T>(
    query: string,
    params: any[],
    timeout: number
  ): Promise<T> {
    // Simulate network delay
    await this.sleep(Math.random() * 100 + 50);

    // Simulate different query types
    if (query.toLowerCase().includes('select')) {
      return [] as T;
    } else if (query.toLowerCase().includes('insert')) {
      return { id: Math.random().toString(36), ...params[0] } as T;
    } else if (query.toLowerCase().includes('update')) {
      return { affected: Math.floor(Math.random() * 5) + 1 } as T;
    } else if (query.toLowerCase().includes('delete')) {
      return { affected: Math.floor(Math.random() * 3) + 1 } as T;
    }

    return {} as T;
  }

  /**
   * Batch insert operation
   */
  public async batchInsert<T>(
    table: string,
    records: T[],
    options: QueryOptions = {}
  ): Promise<{ inserted: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;

    try {
      await transactionManager.executeInTransaction(
        async (context: TransactionContext) => {
          for (const record of records) {
            try {
              await this.executeQueryInternal(
                `INSERT INTO ${table} VALUES (?)`,
                [record],
                options.timeout || this.config.queryTimeout!,
                context
              );
              inserted++;
            } catch (error) {
              errors.push(`Failed to insert record: ${normalizeError(error).message}`);
            }
          }
        },
        { timeout: options.timeout || this.config.queryTimeout }
      );
    } catch (error) {
      errors.push(`Batch insert transaction failed: ${normalizeError(error).message}`);
    }

    return { inserted, errors };
  }

  /**
   * Get database health status
   */
  public async getHealthStatus(): Promise<{
    healthy: boolean;
    connections: number;
    activeTransactions: number;
    timestamp: string;
  }> {
    try {
      const stats = transactionManager.getStats();
      
      return {
        healthy: true,
        connections: stats.activeConnections,
        activeTransactions: stats.activeTransactions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        healthy: false,
        connections: 0,
        activeTransactions: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(): string {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const databaseService = DatabaseService.getInstance();
export default databaseService;
