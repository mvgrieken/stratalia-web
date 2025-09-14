import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Content API Tests', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  describe('GET /api/content/approved', () => {
    it('should return only approved content', async () => {
      const response = await fetch(`${baseUrl}/api/content/approved`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      // Check that all returned content has status 'approved'
      data.forEach((item: any) => {
        expect(item.status).toBe('approved');
      });
    });

    it('should return content with required fields', async () => {
      const response = await fetch(`${baseUrl}/api/content/approved`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      
      if (data.length > 0) {
        const item = data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('content_type');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('created_at');
        expect(typeof item.id).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(typeof item.content_type).toBe('string');
        expect(typeof item.status).toBe('string');
      }
    });

    it('should handle empty results gracefully', async () => {
      const response = await fetch(`${baseUrl}/api/content/approved`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      // Empty array is valid - no approved content yet
    });
  });
});
