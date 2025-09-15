import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Integration tests for API endpoints
describe('API Integration Tests', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  describe('Health Check API', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.message).toBe('All systems operational');
      expect(data.checks.database).toBe('ok');
      expect(data.checks.environment).toBe('ok');
      expect(typeof data.responseTime).toBe('string');
    });

    it('should include required fields', async () => {
      const response = await fetch(`${baseUrl}/api/health`);
      const data = await response.json();
      
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('checks');
    });
  });

  describe('Words Search API', () => {
    it('should search for existing word "skeer"', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=skeer&limit=1`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      const word = data[0];
      expect(word).toHaveProperty('id');
      expect(word).toHaveProperty('word');
      expect(word).toHaveProperty('meaning');
      expect(word).toHaveProperty('example');
      expect(word.word.toLowerCase()).toContain('skeer');
    });

    it('should return empty array for non-existent word', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=nonexistentword123&limit=1`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should handle missing query parameter', async () => {
      const response = await fetch(`${baseUrl}/api/words/search`);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Query parameter is required');
    });

    it('should respect limit parameter', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=a&limit=3`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(3);
    });

    it('should include match_type and similarity_score', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=skeer&limit=1`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      if (data.length > 0) {
        const word = data[0];
        expect(word).toHaveProperty('match_type');
        expect(word).toHaveProperty('similarity_score');
        expect(['exact', 'partial']).toContain(word.match_type);
        expect(typeof word.similarity_score).toBe('number');
      }
    });
  });

  describe('Daily Word API', () => {
    it('should return a daily word', async () => {
      const response = await fetch(`${baseUrl}/api/words/daily`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('word');
      expect(data).toHaveProperty('meaning');
      expect(data).toHaveProperty('example');
      expect(data).toHaveProperty('date');
      
      // Validate date format (YYYY-MM-DD)
      expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should return consistent word for same day', async () => {
      const response1 = await fetch(`${baseUrl}/api/words/daily`);
      const response2 = await fetch(`${baseUrl}/api/words/daily`);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.date).toBe(data2.date);
      // Note: Word might be different if no daily word is set and random selection is used
    });

    it('should have valid word structure', async () => {
      const response = await fetch(`${baseUrl}/api/words/daily`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(typeof data.id).toBe('string');
      expect(typeof data.word).toBe('string');
      expect(typeof data.meaning).toBe('string');
      expect(typeof data.example).toBe('string');
      expect(data.word.length).toBeGreaterThan(0);
      expect(data.meaning.length).toBeGreaterThan(0);
    });
  });

  describe('Content Approved API', () => {
    it('should return approved content', async () => {
      const response = await fetch(`${baseUrl}/api/content/approved`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      // If there's content, validate structure
      if (data.length > 0) {
        const item = data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('word');
        expect(item).toHaveProperty('definition');
        expect(item).toHaveProperty('example');
        expect(item).toHaveProperty('status');
        expect(item.status).toBe('approved');
      }
    });

    it('should only return approved status items', async () => {
      const response = await fetch(`${baseUrl}/api/content/approved`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      if (data.length > 0) {
        data.forEach((item: any) => {
          expect(item.status).toBe('approved');
        });
      }
    });
  });

  describe('API Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      const response = await fetch(`${baseUrl}/api/words/search?query=test&limit=1`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // 2 seconds max
    });

    it('should have proper cache headers', async () => {
      const response = await fetch(`${baseUrl}/api/words/daily`);
      expect(response.status).toBe(200);
      
      const cacheControl = response.headers.get('cache-control');
      expect(cacheControl).toContain('max-age');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoints gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/nonexistent`);
      expect(response.status).toBe(404);
    });

    it('should return proper error format', async () => {
      const response = await fetch(`${baseUrl}/api/words/search`);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
    });
  });
});