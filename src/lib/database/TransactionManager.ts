/**
 * Transaction Manager
 * Handles database transactions and connection pooling
 */

import { logger } from '@/lib/logger';
import { normalizeError } from '@/lib/errors';
import { AppError, Errors } from '@/lib/errors';

export interface TransactionOptions {
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
  retries?: number;
}

export interface TransactionContext {
  id: string;
  startTime: number;
  options: TransactionOptions;
}

export class TransactionManager {
  private static instance: TransactionManager;
  private activeTransactions: Map<string, TransactionContext> = new Map();
  private connectionPool: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  /**
   * Execute a function within a transaction
   */
  public async executeInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const transactionId = this.generateTransactionId();
    const context: TransactionContext = {
      id: transactionId,
      startTime: Date.now(),
      options: {
        isolationLevel: 'READ_COMMITTED',
        timeout: 30000, // 30 seconds
        retries: 3,
        ...options,
      },
    };

    this.activeTransactions.set(transactionId, context);

    try {
      logger.info(`Starting transaction: ${transactionId}`);
      
      const result = await this.withRetry(
        () => this.executeWithTimeout(operation, context),
        context.options.retries!,
        transactionId
      );

      logger.info(`Transaction completed: ${transactionId}`);
      return result;
    } catch (error) {
      logger.error(`Transaction failed: ${transactionId}`, normalizeError(error));
      throw error;
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    operation: (context: TransactionContext) => Promise<T>,
    context: TransactionContext
  ): Promise<T> {
    return Promise.race([
      operation(context),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Transaction timeout after ${context.options.timeout}ms`));
        }, context.options.timeout);
      }),
    ]);
  }

  /**
   * Retry mechanism for transactions
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    transactionId: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = normalizeError(error);
        
        if (attempt === maxRetries) {
          logger.warn(`Transaction ${transactionId} failed after ${attempt} attempts`);
          throw lastError;
        }

        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        logger.warn(`Transaction ${transactionId} attempt ${attempt} failed, retrying in ${delay}ms`);
        
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Get connection from pool
   */
  public async getConnection(connectionId: string = 'default'): Promise<any> {
    if (this.connectionPool.has(connectionId)) {
      return this.connectionPool.get(connectionId);
    }

    // In a real implementation, this would create a new database connection
    // For now, we'll return a mock connection object
    const connection = {
      id: connectionId,
      createdAt: Date.now(),
      isActive: true,
    };

    this.connectionPool.set(connectionId, connection);
    logger.info(`New connection created: ${connectionId}`);
    
    return connection;
  }

  /**
   * Release connection back to pool
   */
  public async releaseConnection(connectionId: string): Promise<void> {
    if (this.connectionPool.has(connectionId)) {
      const connection = this.connectionPool.get(connectionId);
      connection.isActive = false;
      logger.info(`Connection released: ${connectionId}`);
    }
  }

  /**
   * Get transaction statistics
   */
  public getStats(): {
    activeTransactions: number;
    totalConnections: number;
    activeConnections: number;
  } {
    const activeConnections = Array.from(this.connectionPool.values())
      .filter((conn: any) => conn.isActive).length;

    return {
      activeTransactions: this.activeTransactions.size,
      totalConnections: this.connectionPool.size,
      activeConnections,
    };
  }

  /**
   * Cleanup inactive connections
   */
  public async cleanupConnections(): Promise<void> {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [id, connection] of Array.from(this.connectionPool.entries())) {
      if (!connection.isActive && (now - connection.createdAt) > maxAge) {
        this.connectionPool.delete(id);
        logger.info(`Cleaned up inactive connection: ${id}`);
      }
    }
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const transactionManager = TransactionManager.getInstance();
export default transactionManager;
