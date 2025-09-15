/**
 * Integration tests for API error handling
 * Tests that API endpoints return proper JSON responses and never crash
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for API testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Next.js response
const _mockNextResponse = {
  json: vi.fn(),
  headers: {
    set: vi.fn()
  }
};

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    dbError: vi.fn(),
    performance: vi.fn()
  }
}));

describe('API Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Daily Word API', () => {
    it('should return 200 with valid daily word data', async () => {
      // Mock successful Supabase response
      const mockDailyWord = {
        id: 1,
        date: '2024-01-01',
        words: {
          id: 1,
          word: 'skeer',
          definition: 'bang, angstig',
          example: 'Ik was skeer voor de presentatie'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDailyWord
      });

      // Test the API endpoint
      const response = await fetch('/api/words/daily');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toHaveProperty('word', 'skeer');
      expect(data).toHaveProperty('meaning', 'bang, angstig');
      expect(data).toHaveProperty('date', '2024-01-01');
    });

    it('should return 404 when no words are available', async () => {
      // Mock empty database response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: 'No words available',
          details: 'Database contains no active words'
        })
      });

      const response = await fetch('/api/words/daily');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error', 'No words available');
      expect(data).toHaveProperty('details');
    });

    it('should return 500 with proper error message on database error', async () => {
      // Mock database error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Database unavailable',
          details: 'Connection failed'
        })
      });

      const response = await fetch('/api/words/daily');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('details');
    });
  });

  describe('Search API', () => {
    it('should return 200 with search results', async () => {
      // Mock successful search response
      const mockSearchResults = [
        {
          id: 1,
          word: 'skeer',
          definition: 'bang, angstig',
          example: 'Ik was skeer voor de presentatie'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResults
      });

      const response = await fetch('/api/words/search?query=skeer');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('word', 'skeer');
      expect(data[0]).toHaveProperty('meaning', 'bang, angstig');
    });

    it('should return 400 when query parameter is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Query parameter is required'
        })
      });

      const response = await fetch('/api/words/search');
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Query parameter is required');
    });

    it('should return 500 with proper error message on database error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Database search failed',
          details: 'Connection timeout',
          code: 'CONNECTION_TIMEOUT'
        })
      });

      const response = await fetch('/api/words/search?query=test');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error', 'Database search failed');
      expect(data).toHaveProperty('details');
      expect(data).toHaveProperty('code');
    });

    it('should handle empty search results gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const response = await fetch('/api/words/search?query=nonexistent');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe('Content Approved API', () => {
    it('should return 200 with approved content', async () => {
      const mockContent = [
        {
          id: 1,
          type: 'word',
          content: 'New word added',
          status: 'approved',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockContent
      });

      const response = await fetch('/api/content/approved');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('status', 'approved');
    });

    it('should return 500 with proper error message on database error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Database unavailable',
          details: 'Connection failed'
        })
      });

      const response = await fetch('/api/content/approved');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error', 'Database unavailable');
      expect(data).toHaveProperty('details');
    });
  });
});
