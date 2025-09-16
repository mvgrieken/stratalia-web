/**
 * Rate limiting middleware
 * Simple in-memory rate limiter (for production, use Redis)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get current stats
   */
  getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.requests.values()) {
      if (now <= entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.requests.size,
      activeEntries
    };
  }
}

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiter
  api: new RateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // Search rate limiter (more restrictive)
  search: new RateLimiter(1 * 60 * 1000, 30), // 30 requests per minute
  
  // Quiz rate limiter
  quiz: new RateLimiter(5 * 60 * 1000, 20), // 20 requests per 5 minutes
  
  // Auth rate limiter (very restrictive)
  auth: new RateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes
};

// Auto-cleanup every 5 minutes
setInterval(() => {
  Object.values(rateLimiters).forEach(limiter => {
    const cleaned = limiter.cleanup();
    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  });
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (for production with proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // For development, use a combination of IP and user agent
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${clientIp}:${userAgent.slice(0, 50)}`;
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  limiterType: keyof typeof rateLimiters = 'api',
  customLimiter?: RateLimiter
) {
  return function rateLimitMiddleware(
    request: NextRequest,
    handler: (_request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const limiter = customLimiter || rateLimiters[limiterType];
    const identifier = getClientIdentifier(request);
    
    const { allowed, remaining, resetTime } = limiter.isAllowed(identifier);

    // Add rate limit headers
    const response = allowed 
      ? handler(request)
      : Promise.resolve(
          NextResponse.json(
            {
              success: false,
              error: {
                code: 'RATE_LIMITED',
                message: 'Too many requests. Please try again later.',
                details: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds.`
              }
            },
            { status: 429 }
          )
        );

    return response.then(res => {
      // Add rate limit headers to response
      res.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
      res.headers.set('X-RateLimit-Remaining', remaining.toString());
      res.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
      
      if (!allowed) {
        res.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
        logger.warn('Rate limit exceeded', { 
          identifier, 
          limiterType, 
          remaining, 
          resetTime: new Date(resetTime).toISOString() 
        });
      }

      return res;
    });
  };
}

/**
 * Apply rate limiting to API routes
 */
export function applyRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'api'
): { allowed: boolean; response?: NextResponse } {
  const limiter = rateLimiters[limiterType];
  const identifier = getClientIdentifier(request);
  
  const { allowed, remaining, resetTime } = limiter.isAllowed(identifier);

  if (!allowed) {
    const response = NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: `Rate limit exceeded. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)} seconds.`
        }
      },
      { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

    logger.warn('Rate limit exceeded', { 
      identifier, 
      limiterType, 
      remaining, 
      resetTime: new Date(resetTime).toISOString() 
    });

    return { allowed: false, response };
  }

  return { allowed: true };
}

export { rateLimiters };
