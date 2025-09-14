import { describe, it, expect, beforeAll } from '@jest/globals';

describe('API Integration Tests', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  describe('API Health Check', () => {
    it('should have all main API endpoints responding', async () => {
      const endpoints = [
        '/api/words/search?query=test',
        '/api/words/daily',
        '/api/content/approved',
        '/api/gamification/leaderboard',
        '/api/gamification/challenges'
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${baseUrl}${endpoint}`);
        expect(response.status).toBe(200);
        
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });
  });

  describe('Data Consistency Tests', () => {
    it('should return consistent data types across API calls', async () => {
      // Test words search
      const wordsResponse = await fetch(`${baseUrl}/api/words/search?query=a&limit=1`);
      const wordsData = await wordsResponse.json();
      expect(Array.isArray(wordsData)).toBe(true);

      // Test daily word
      const dailyResponse = await fetch(`${baseUrl}/api/words/daily`);
      const dailyData = await dailyResponse.json();
      expect(typeof dailyData).toBe('object');
      expect(dailyData).toHaveProperty('word');

      // Test content approved
      const contentResponse = await fetch(`${baseUrl}/api/content/approved`);
      const contentData = await contentResponse.json();
      expect(Array.isArray(contentData)).toBe(true);

      // Test leaderboard
      const leaderboardResponse = await fetch(`${baseUrl}/api/gamification/leaderboard`);
      const leaderboardData = await leaderboardResponse.json();
      expect(leaderboardData).toHaveProperty('leaderboard');
      expect(Array.isArray(leaderboardData.leaderboard)).toBe(true);

      // Test challenges
      const challengesResponse = await fetch(`${baseUrl}/api/gamification/challenges`);
      const challengesData = await challengesResponse.json();
      expect(challengesData).toHaveProperty('challenges');
      expect(Array.isArray(challengesData.challenges)).toBe(true);
    });

    it('should handle error cases gracefully', async () => {
      // Test invalid search query
      const invalidSearchResponse = await fetch(`${baseUrl}/api/words/search?query=`);
      expect(invalidSearchResponse.status).toBe(200);
      const invalidSearchData = await invalidSearchResponse.json();
      expect(Array.isArray(invalidSearchData)).toBe(true);

      // Test invalid limit parameter
      const invalidLimitResponse = await fetch(`${baseUrl}/api/words/search?query=test&limit=invalid`);
      expect(invalidLimitResponse.status).toBe(200);
      const invalidLimitData = await invalidLimitResponse.json();
      expect(Array.isArray(invalidLimitData)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/words/search?query=test&limit=10`);
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        fetch(`${baseUrl}/api/words/daily`)
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      const data = await Promise.all(responses.map(r => r.json()));
      data.forEach(d => {
        expect(d).toHaveProperty('word');
        expect(d).toHaveProperty('meaning');
      });
    });
  });
});
