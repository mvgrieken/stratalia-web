/**
 * Performance Monitoring Middleware
 * Tracks API performance, response times, and resource usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { monitoringService } from '@/lib/monitoring';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  error?: string;
}

export class PerformanceMiddleware {
  private static instance: PerformanceMiddleware;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceMiddleware {
    if (!PerformanceMiddleware.instance) {
      PerformanceMiddleware.instance = new PerformanceMiddleware();
    }
    return PerformanceMiddleware.instance;
  }

  /**
   * Start tracking a request
   */
  public startTracking(request: NextRequest): string {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const metrics: PerformanceMetrics = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: this.getClientIP(request),
      startTime,
      memoryUsage: process.memoryUsage(),
    };

    this.metrics.set(requestId, metrics);

    // Add request ID to headers for tracing
    const response = NextResponse.next();
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Start-Time', startTime.toString());

    return requestId;
  }

  /**
   * End tracking a request
   */
  public endTracking(
    requestId: string,
    response: NextResponse,
    error?: Error
  ): void {
    const metrics = this.metrics.get(requestId);
    if (!metrics) {
      logger.warn(`No metrics found for request ID: ${requestId}`);
      return;
    }

    const endTime = Date.now();
    const duration = endTime - metrics.startTime;

    // Update metrics
    metrics.endTime = endTime;
    metrics.duration = duration;
    metrics.statusCode = response.status;
    metrics.responseSize = this.getResponseSize(response);
    metrics.memoryUsage = process.memoryUsage();
    metrics.error = error?.message;

    // Record metrics
    this.recordMetrics(metrics);

    // Clean up
    this.metrics.delete(requestId);
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    try {
      // Record API call metric
      monitoringService.recordMetric({
        name: 'api_call_duration',
        value: metrics.duration!,
        unit: 'ms',
        tags: {
          method: metrics.method,
          endpoint: this.getEndpoint(metrics.url),
          status_code: metrics.statusCode?.toString() || 'unknown',
          has_error: metrics.error ? 'true' : 'false',
        },
      });

      // Record response size metric
      if (metrics.responseSize) {
        monitoringService.recordMetric({
          name: 'api_response_size',
          value: metrics.responseSize,
          unit: 'bytes',
          tags: {
            method: metrics.method,
            endpoint: this.getEndpoint(metrics.url),
          },
        });
      }

      // Record memory usage
      if (metrics.memoryUsage) {
        monitoringService.recordMetric({
          name: 'memory_usage',
          value: metrics.memoryUsage.heapUsed,
          unit: 'bytes',
          tags: {
            type: 'heap_used',
          },
        });

        monitoringService.recordMetric({
          name: 'memory_usage',
          value: metrics.memoryUsage.heapTotal,
          unit: 'bytes',
          tags: {
            type: 'heap_total',
          },
        });
      }

      // Log performance summary
      logger.info(`Request completed: ${metrics.requestId} - method=${metrics.method}, endpoint=${this.getEndpoint(metrics.url)}, duration=${metrics.duration}ms, statusCode=${metrics.statusCode}, responseSize=${metrics.responseSize ? `${metrics.responseSize} bytes` : 'unknown'}, memoryUsage=${metrics.memoryUsage ? `${Math.round(metrics.memoryUsage.heapUsed / 1024 / 1024)} MB` : 'unknown'}, error=${metrics.error || 'none'}`);

    } catch (error) {
      logger.error(`Failed to record performance metrics ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string | undefined {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return undefined;
  }

  /**
   * Get response size
   */
  private getResponseSize(response: NextResponse): number | undefined {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : undefined;
  }

  /**
   * Extract endpoint from URL
   */
  private getEndpoint(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Normalize API endpoints
      if (pathname.startsWith('/api/')) {
        return pathname.replace(/\/\d+/g, '/:id'); // Replace IDs with :id
      }
      
      return pathname;
    } catch {
      return url;
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current performance statistics
   */
  public getStats(): {
    activeRequests: number;
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const activeRequests = this.metrics.size;
    
    // In a real implementation, these would be tracked over time
    const totalRequests = 0;
    const averageResponseTime = 0;
    const errorRate = 0;

    return {
      activeRequests,
      totalRequests,
      averageResponseTime,
      errorRate,
    };
  }

  /**
   * Cleanup old metrics
   */
  public cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [requestId, metrics] of Array.from(this.metrics.entries())) {
      if (now - metrics.startTime > maxAge) {
        this.metrics.delete(requestId);
      }
    }
  }
}

export const performanceMiddleware = PerformanceMiddleware.getInstance();
export default performanceMiddleware;
