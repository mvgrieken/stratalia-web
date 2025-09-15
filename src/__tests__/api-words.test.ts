import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Words API Tests', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  describe('GET /api/words/search', () => {
    it('should return search results for "skeer"', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=skeer`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Check if the result contains the searched word
      const hasSkeer = data.some((word: any) => 
        word.word?.toLowerCase().includes('skeer') || 
        word.meaning?.toLowerCase().includes('skeer')
      );
      expect(hasSkeer).toBe(true);
    });

    it('should return empty array for non-existent word', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=xyz123nonexistent`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('should handle limit parameter', async () => {
      const response = await fetch(`${baseUrl}/api/words/search?query=a&limit=5`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/words/daily', () => {
    it('should return daily word with required fields', async () => {
      const response = await fetch(`${baseUrl}/api/words/daily`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('word');
      expect(data).toHaveProperty('meaning');
      expect(data).toHaveProperty('date');
      expect(typeof data.word).toBe('string');
      expect(typeof data.meaning).toBe('string');
      expect(typeof data.date).toBe('string');
      expect(data.word.length).toBeGreaterThan(0);
      expect(data.meaning.length).toBeGreaterThan(0);
    });

    it('should return consistent daily word for same day', async () => {
      const response1 = await fetch(`${baseUrl}/api/words/daily`);
      const response2 = await fetch(`${baseUrl}/api/words/daily`);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.word).toBe(data2.word);
      expect(data1.meaning).toBe(data2.meaning);
      expect(data1.date).toBe(data2.date);
    });
  });
});
