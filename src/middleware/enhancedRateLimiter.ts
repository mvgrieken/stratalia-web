/**
 * Enhanced rate limiting middleware with security features
 * Protects API endpoints from abuse with advanced detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
  suspiciousActivity: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstLimit?: number;
  blockDurationMs?: number;
  suspiciousThreshold?: number;
}

class EnhancedRateLimiter {
  private requests = new Map<string, RateLimitEntry>();
  
  private configs: Record<string, RateLimitConfig> = {
    default: { 
      windowMs: 60000, 
      maxRequests: 60,
      blockDurationMs: 300000, // 5 minutes
      suspiciousThreshold: 3
    },
    search: { 
      windowMs: 60000, 
      maxRequests: 100, 
      burstLimit: 10,
      blockDurationMs: 180000, // 3 minutes
      suspiciousThreshold: 5
    },
    translate: { 
      windowMs: 60000, 
      maxRequests: 30, 
      burstLimit: 5,
      blockDurationMs: 600000, // 10 minutes
      suspiciousThreshold: 3
    },
    auth: { 
      windowMs: 300000, 
      maxRequests: 5,
      blockDurationMs: 900000, // 15 minutes
      suspiciousThreshold: 2
    },
    admin: { 
      windowMs: 60000, 
      maxRequests: 20,
      blockDurationMs: 1800000, // 30 minutes
      suspiciousThreshold: 1
    },
  };

  private getClientId(request: NextRequest): string {
    // Enhanced fingerprinting for better security
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    const ip = forwarded?.split(',')[0]?.trim() || realIp || cfConnectingIp || 'unknown';
    
    // Include user agent for fingerprinting
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const fingerprint = this.createFingerprint(ip, userAgent);
    return fingerprint;
  }

  private createFingerprint(ip: string, userAgent: string): string {
    const combined = `${ip}:${this.simpleHash(userAgent)}`;
    return this.simpleHash(combined);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private detectSuspiciousActivity(request: NextRequest, entry: RateLimitEntry): boolean {
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // Detect bot-like behavior
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|python|node/i,
      /automated|script|tool/i
    ];
    
    const isSuspiciousUA = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    const noReferer = !referer && request.method === 'POST';
    const rapidRequests = entry.count > 20 && (Date.now() - entry.lastRequest) < 100;
    
    return isSuspiciousUA || noReferer || rapidRequests;
  }

  public checkLimit(request: NextRequest, endpoint: string = 'default'): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    response?: NextResponse;
  } {
    const clientId = this.getClientId(request);
    const config = this.configs[endpoint] || this.configs.default;
    const key = `${endpoint}:${clientId}`;
    const now = Date.now();

    // Check if client is blocked
    let entry = this.requests.get(key);
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockUntil,
        response: NextResponse.json({
          error: 'Je bent tijdelijk geblokkeerd vanwege verdachte activiteit.',
          code: 'CLIENT_BLOCKED',
          retryAfter: Math.ceil((entry.blockUntil - now) / 1000)
        }, { status: 429 })
      };
    }

    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        lastRequest: now,
        suspiciousActivity: 0,
        blocked: false
      };
    }

    // Detect suspicious activity
    if (this.detectSuspiciousActivity(request, entry)) {
      entry.suspiciousActivity++;
      
      if (entry.suspiciousActivity >= (config.suspiciousThreshold || 3)) {
        entry.blocked = true;
        entry.blockUntil = now + (config.blockDurationMs || 300000);
        this.requests.set(key, entry);
        
        logger.warn(`Client blocked for suspicious activity: ${endpoint}`);
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.blockUntil,
          response: NextResponse.json({
            error: 'Verdachte activiteit gedetecteerd. Je bent tijdelijk geblokkeerd.',
            code: 'SUSPICIOUS_ACTIVITY_BLOCKED'
          }, { status: 429 })
        };
      }
    }

    // Check rate limits
    if (entry.count >= config.maxRequests) {
      logger.warn(`Rate limit exceeded: ${endpoint}`);
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        response: NextResponse.json({
          error: 'Te veel verzoeken. Probeer het later opnieuw.',
          code: 'RATE_LIMIT_EXCEEDED'
        }, { status: 429 })
      };
    }

    // Allow request
    entry.count++;
    entry.lastRequest = now;
    this.requests.set(key, entry);

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }
}

const enhancedRateLimiter = new EnhancedRateLimiter();

export function applyEnhancedRateLimit(request: NextRequest, endpoint: string = 'default') {
  return enhancedRateLimiter.checkLimit(request, endpoint);
}

export default enhancedRateLimiter;
