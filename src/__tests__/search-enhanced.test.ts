import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/words/search/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/middleware/rateLimiter', () => ({
  applyRateLimit: vi.fn(() => ({ 
    allowed: true, 
    remaining: 100, 
    resetTime: Date.now() + 3600000 
  }))
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('@/lib/config', () => ({
  isSupabaseConfigured: vi.fn(() => false) // Test fallback mode
}));

describe('Enhanced Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Waggi Search Tests', () => {
    it('should find waggi with exact match', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=waggi&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.results).toHaveLength(1);
      expect(data.data.results[0].word).toBe('waggi');
      expect(data.data.results[0].meaning).toBe('auto, wagen');
      expect(data.data.results[0].match_type).toBe('exact');
      expect(data.data.results[0].similarity_score).toBe(1.0);
      expect(data.data.source).toBe('fallback');
    });

    it('should find waggi with case insensitive search', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=WAGGI&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results[0].word).toBe('waggi');
      expect(data.data.results[0].match_type).toBe('exact');
    });

    it('should find multiple results for partial match', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=wag&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results.length).toBeGreaterThan(1);
      
      const waggiResult = data.data.results.find((r: any) => r.word === 'waggi');
      expect(waggiResult).toBeDefined();
      expect(waggiResult.match_type).toBe('partial');
      
      const swagResult = data.data.results.find((r: any) => r.word === 'swag');
      expect(swagResult).toBeDefined();
    });

    it('should provide suggestions for empty query', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results).toHaveLength(0);
      expect(data.data.suggestions).toContain('waggi');
      expect(data.data.suggestions.length).toBeGreaterThan(5);
    });

    it('should provide suggestions for no results', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=nonexistentword123&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.results).toHaveLength(0);
      expect(data.data.suggestions).toContain('waggi');
      expect(data.data.message).toContain('Geen resultaten gevonden');
    });

    it('should include query info in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=waggi&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.query_info).toBeDefined();
      expect(data.data.query_info.original).toBe('waggi');
      expect(data.data.query_info.normalized).toBe('waggi');
      expect(data.data.query_info.search_type).toBe('exact_match');
    });

    it('should handle rate limiting', async () => {
      const { applyRateLimit } = await import('@/middleware/rateLimiter');
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000,
        response: new Response(JSON.stringify({
          error: 'Rate limit exceeded'
        }), { status: 429 })
      });

      const request = new NextRequest('http://localhost:3000/api/words/search?query=waggi');
      const response = await GET(request);

      expect(response.status).toBe(429);
    });

    it('should validate query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/words/search?query=a&limit=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should use default limit when invalid
      expect(data.data.total).toBeDefined();
    });

    it('should cache search results', async () => {
      // First request
      const request1 = new NextRequest('http://localhost:3000/api/words/search?query=waggi&limit=10');
      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(data1.data.source).toBe('fallback');

      // Second request should be cached
      const request2 = new NextRequest('http://localhost:3000/api/words/search?query=waggi&limit=10');
      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data2.data.source).toBe('cache');
    });
  });

  describe('Search Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const request = new NextRequest('http://localhost:3000/api/words/search?query=waggi&limit=10');
      await GET(request);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        new NextRequest(`http://localhost:3000/api/words/search?query=test${i}&limit=10`)
      );

      const responses = await Promise.all(requests.map(req => GET(req)));
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
