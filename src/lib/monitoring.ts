/**
 * Monitoring and APM service
 * Provides performance monitoring, error tracking, and analytics
 */

import { logger } from '@/lib/logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  tags?: Record<string, string>;
}

export interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  tags?: Record<string, string>;
}

export interface UserAction {
  action: string;
  userId?: string;
  timestamp: string;
  properties?: Record<string, any>;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private userActions: UserAction[] = [];
  private readonly maxMetrics = 1000;
  private readonly maxErrors = 500;
  private readonly maxUserActions = 1000;

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date().toISOString()
    };

    this.metrics.push(fullMetric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    logger.debug('Performance metric recorded', fullMetric);
  }

  /**
   * Record an error
   */
  recordError(error: Omit<ErrorMetric, 'timestamp'>): void {
    const fullError: ErrorMetric = {
      ...error,
      timestamp: new Date().toISOString()
    };

    this.errors.push(fullError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    logger.error('Error recorded', new Error(error.message), {
      stack: error.stack,
      userId: error.userId,
      url: error.url,
      tags: error.tags
    });
  }

  /**
   * Record a user action
   */
  recordUserAction(action: Omit<UserAction, 'timestamp'>): void {
    const fullAction: UserAction = {
      ...action,
      timestamp: new Date().toISOString()
    };

    this.userActions.push(fullAction);
    
    // Keep only the most recent actions
    if (this.userActions.length > this.maxUserActions) {
      this.userActions = this.userActions.slice(-this.maxUserActions);
    }

    logger.info('User action recorded', fullAction);
  }

  /**
   * Get performance metrics
   */
  getMetrics(filter?: { name?: string; since?: Date }): PerformanceMetric[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter(m => m.name === filter.name);
    }

    if (filter?.since) {
      filtered = filtered.filter(m => new Date(m.timestamp) >= filter.since!);
    }

    return filtered;
  }

  /**
   * Get error metrics
   */
  getErrors(filter?: { since?: Date; userId?: string }): ErrorMetric[] {
    let filtered = this.errors;

    if (filter?.since) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= filter.since!);
    }

    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }

    return filtered;
  }

  /**
   * Get user actions
   */
  getUserActions(filter?: { action?: string; userId?: string; since?: Date }): UserAction[] {
    let filtered = this.userActions;

    if (filter?.action) {
      filtered = filtered.filter(a => a.action === filter.action);
    }

    if (filter?.userId) {
      filtered = filtered.filter(a => a.userId === filter.userId);
    }

    if (filter?.since) {
      filtered = filtered.filter(a => new Date(a.timestamp) >= filter.since!);
    }

    return filtered;
  }

  /**
   * Get monitoring statistics
   */
  getStats(): {
    metrics: { total: number; byName: Record<string, number> };
    errors: { total: number; byMessage: Record<string, number> };
    userActions: { total: number; byAction: Record<string, number> };
  } {
    const metricsByName: Record<string, number> = {};
    this.metrics.forEach(m => {
      metricsByName[m.name] = (metricsByName[m.name] || 0) + 1;
    });

    const errorsByMessage: Record<string, number> = {};
    this.errors.forEach(e => {
      errorsByMessage[e.message] = (errorsByMessage[e.message] || 0) + 1;
    });

    const actionsByAction: Record<string, number> = {};
    this.userActions.forEach(a => {
      actionsByAction[a.action] = (actionsByAction[a.action] || 0) + 1;
    });

    return {
      metrics: {
        total: this.metrics.length,
        byName: metricsByName
      },
      errors: {
        total: this.errors.length,
        byMessage: errorsByMessage
      },
      userActions: {
        total: this.userActions.length,
        byAction: actionsByAction
      }
    };
  }

  /**
   * Clear old data
   */
  clearOldData(olderThanHours: number = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    this.metrics = this.metrics.filter(m => new Date(m.timestamp) > cutoff);
    this.errors = this.errors.filter(e => new Date(e.timestamp) > cutoff);
    this.userActions = this.userActions.filter(a => new Date(a.timestamp) > cutoff);

    logger.info('Old monitoring data cleared', { 
      cutoff: cutoff.toISOString(),
      metricsRemaining: this.metrics.length,
      errorsRemaining: this.errors.length,
      actionsRemaining: this.userActions.length
    });
  }
}

// Singleton instance
export const monitoringService = new MonitoringService();

/**
 * Performance monitoring decorators and utilities
 */
export const performance = {
  /**
   * Measure function execution time
   */
  measure<T extends (..._args: any[]) => any>(
    fn: T,
    metricName: string,
    tags?: Record<string, string>
  ): T {
    return ((..._args: any[]) => {
      const start = performance.now();
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - start;
          monitoringService.recordMetric({
            name: metricName,
            value: duration,
            unit: 'ms',
            tags
          });
        });
      } else {
        const duration = performance.now() - start;
        monitoringService.recordMetric({
          name: metricName,
          value: duration,
          unit: 'ms',
          tags
        });
        return result;
      }
    }) as T;
  },

  /**
   * Measure async function execution time
   */
  async measureAsync<T>(
    fn: () => Promise<T>,
    metricName: string,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      monitoringService.recordMetric({
        name: metricName,
        value: duration,
        unit: 'ms',
        tags
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      monitoringService.recordMetric({
        name: `${metricName}.error`,
        value: duration,
        unit: 'ms',
        tags: { ...tags, error: 'true' }
      });
      throw error;
    }
  }
};

/**
 * Error tracking utilities
 */
export const errorTracking = {
  /**
   * Track an error with context
   */
  track(error: Error, context?: {
    userId?: string;
    url?: string;
    userAgent?: string;
    tags?: Record<string, string>;
  }): void {
    monitoringService.recordError({
      message: error.message,
      stack: error.stack,
      userId: context?.userId,
      url: context?.url,
      userAgent: context?.userAgent,
      tags: context?.tags
    });
  },

  /**
   * Track an error from a request
   */
  trackFromRequest(error: Error, request: Request, context?: {
    userId?: string;
    tags?: Record<string, string>;
  }): void {
    monitoringService.recordError({
      message: error.message,
      stack: error.stack,
      userId: context?.userId,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      tags: context?.tags
    });
  }
};

/**
 * User analytics utilities
 */
export const analytics = {
  /**
   * Track a user action
   */
  track(action: string, properties?: Record<string, any>, userId?: string): void {
    monitoringService.recordUserAction({
      action,
      userId,
      properties
    });
  },

  /**
   * Track page view
   */
  trackPageView(page: string, userId?: string): void {
    monitoringService.recordUserAction({
      action: 'page_view',
      userId,
      properties: { page }
    });
  },

  /**
   * Track API call
   */
  trackApiCall(endpoint: string, method: string, statusCode: number, userId?: string): void {
    monitoringService.recordUserAction({
      action: 'api_call',
      userId,
      properties: { endpoint, method, statusCode }
    });
  }
};

// Auto-cleanup old data every hour
setInterval(() => {
  monitoringService.clearOldData(24); // Keep 24 hours of data
}, 60 * 60 * 1000);
