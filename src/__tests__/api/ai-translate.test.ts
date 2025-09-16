import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/translate/route';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';
import { isSupabaseConfigured } from '@/lib/supabase-client';

// Mock dependencies
vi.mock('@/middleware/rateLimiter');
vi.mock('@/lib/logger');
vi.mock('@/lib/supabase-client');

describe('/api/ai/translate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST', () => {
    it('should translate text successfully with Supabase', async () => {
      const translateRequest = {
        text: 'skeer',
        targetLanguage: 'nl'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase configuration
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);

      // Mock Supabase client
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [{
                  id: '1',
                  word: 'skeer',
                  meaning: 'arm, weinig geld hebben',
                  example: 'Ik ben helemaal skeer deze maand.',
                  etymology: 'Afkomstig van het Jiddische woord "sker"'
                }],
                error: null
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        isSupabaseConfigured: vi.fn().mockReturnValue(true),
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translation).toBe('arm, weinig geld hebben');
      expect(data.data.source).toBe('database');
    });

    it('should use fallback translation when Supabase is not configured', async () => {
      const translateRequest = {
        text: 'skeer',
        targetLanguage: 'nl'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase not configured
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translation).toBe('arm, weinig geld hebben');
      expect(data.data.source).toBe('fallback');
    });

    it('should use fallback translation when database query fails', async () => {
      const translateRequest = {
        text: 'skeer',
        targetLanguage: 'nl'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase configuration
      vi.mocked(isSupabaseConfigured).mockReturnValue(true);

      // Mock Supabase client with error
      const mockSupabaseClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Database connection failed')
              })
            })
          })
        })
      };

      vi.doMock('@/lib/supabase-client', () => ({
        isSupabaseConfigured: vi.fn().mockReturnValue(true),
        getSupabaseClient: vi.fn().mockReturnValue(mockSupabaseClient)
      }));

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translation).toBe('arm, weinig geld hebben');
      expect(data.data.source).toBe('fallback');
    });

    it('should handle rate limiting', async () => {
      // Mock rate limiting to deny request
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        response: new Response(JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests'
          }
        }), { status: 429 })
      });

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify({
          text: 'skeer',
          targetLanguage: 'nl'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      expect(applyRateLimit).toHaveBeenCalledWith(request, 'translate');
    });

    it('should validate required fields', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify({
          text: 'skeer'
          // Missing targetLanguage
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate text length', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify({
          text: '', // Empty text
          targetLanguage: 'nl'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate target language', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify({
          text: 'skeer',
          targetLanguage: 'invalid' // Invalid language
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid JSON', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle translation from Dutch to Straattaal', async () => {
      const translateRequest = {
        text: 'arm',
        targetLanguage: 'straattaal'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase not configured to use fallback
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translation).toBe('skeer');
      expect(data.data.source).toBe('fallback');
    });

    it('should handle unknown words gracefully', async () => {
      const translateRequest = {
        text: 'unknownword',
        targetLanguage: 'nl'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase not configured to use fallback
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.translation).toBe('Vertaling niet gevonden');
      expect(data.data.source).toBe('fallback');
    });

    it('should log translation requests', async () => {
      const translateRequest = {
        text: 'skeer',
        targetLanguage: 'nl'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock Supabase not configured to use fallback
      vi.mocked(isSupabaseConfigured).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/ai/translate', {
        method: 'POST',
        body: JSON.stringify(translateRequest),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      await POST(request);

      expect(logger.info).toHaveBeenCalledWith('Translation request: text=skeer, targetLanguage=nl');
    });
  });
});
