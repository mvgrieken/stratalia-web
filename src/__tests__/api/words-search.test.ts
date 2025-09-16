import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/words/search/route';
import { wordService } from '@/services/WordService';
import { applyRateLimit } from '@/middleware/rateLimiter';
import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/services/WordService');
vi.mock('@/middleware/rateLimiter');
vi.mock('@/lib/logger');

describe('/api/words/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return search results successfully', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service
      vi.mocked(wordService.searchWords).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toEqual(mockResults);
      expect(data.data.message).toContain('Gevonden 1 resultaat');
      expect(data.data.total).toBe(1);
      expect(data.data.source).toBe('database');
    });

    it('should return empty results with suggestions when no matches found', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service to return empty results
      vi.mocked(wordService.searchWords).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=nonexistent&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toEqual([]);
      expect(data.data.message).toContain('Geen resultaten gevonden');
      expect(data.data.suggestions).toEqual(['skeer', 'breezy', 'flexen', 'chill', 'dope', 'lit']);
      expect(data.data.total).toBe(0);
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

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer');
      const response = await GET(request);

      expect(response.status).toBe(429);
      expect(applyRateLimit).toHaveBeenCalledWith(request, 'search');
    });

    it('should validate required query parameter', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/words/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate empty query parameter', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/words/search?query=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle word service errors', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service to throw error
      vi.mocked(wordService.searchWords).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('should use default limit when not provided', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service
      vi.mocked(wordService.searchWords).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(wordService.searchWords).toHaveBeenCalledWith('skeer', 10);
    });

    it('should parse custom limit parameter', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service
      vi.mocked(wordService.searchWords).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer&limit=5');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(wordService.searchWords).toHaveBeenCalledWith('skeer', 5);
    });

    it('should handle invalid limit parameter', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service
      vi.mocked(wordService.searchWords).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer&limit=invalid');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(wordService.searchWords).toHaveBeenCalledWith('skeer', 10); // Should use default
    });

    it('should log search requests and results', async () => {
      const mockResults = [
        {
          id: '1',
          word: 'skeer',
          meaning: 'arm, weinig geld hebben',
          example: 'Ik ben helemaal skeer deze maand.',
          match_type: 'exact',
          similarity_score: 1.0
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock word service
      vi.mocked(wordService.searchWords).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/words/search?query=skeer&limit=10');
      await GET(request);

      expect(logger.info).toHaveBeenCalledWith('Search request: query=skeer, limit=10');
      expect(logger.info).toHaveBeenCalledWith('Search completed successfully: resultCount=1, source=database');
    });
  });
});
