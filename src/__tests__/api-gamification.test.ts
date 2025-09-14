import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Gamification API Tests', () => {
  let baseUrl: string;

  beforeAll(() => {
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  });

  describe('GET /api/gamification/leaderboard', () => {
    it('should return leaderboard with users and scores', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/leaderboard`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('leaderboard');
      expect(data).toHaveProperty('total_users');
      expect(Array.isArray(data.leaderboard)).toBe(true);
      expect(typeof data.total_users).toBe('number');
    });

    it('should return leaderboard entries with required fields', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/leaderboard`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.leaderboard)).toBe(true);
      
      if (data.leaderboard.length > 0) {
        const entry = data.leaderboard[0];
        expect(entry).toHaveProperty('user_id');
        expect(entry).toHaveProperty('display_name');
        expect(entry).toHaveProperty('total_points');
        expect(entry).toHaveProperty('rank');
        expect(typeof entry.user_id).toBe('string');
        expect(typeof entry.display_name).toBe('string');
        expect(typeof entry.total_points).toBe('number');
        expect(typeof entry.rank).toBe('number');
      }
    });

    it('should handle limit parameter', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/leaderboard?limit=5`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.leaderboard)).toBe(true);
      expect(data.leaderboard.length).toBeLessThanOrEqual(5);
    });

    it('should return user rank when user_id is provided', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/leaderboard?user_id=demo-user`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user_rank');
      // user_rank can be null if user doesn't exist
      if (data.user_rank) {
        expect(data.user_rank).toHaveProperty('user_id');
        expect(data.user_rank).toHaveProperty('total_points');
        expect(data.user_rank).toHaveProperty('rank');
      }
    });
  });

  describe('GET /api/gamification/challenges', () => {
    it('should return challenges with required structure', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/challenges`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('challenges');
      expect(data).toHaveProperty('user_stats');
      expect(Array.isArray(data.challenges)).toBe(true);
      expect(typeof data.user_stats).toBe('object');
    });

    it('should return challenges with required fields', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/challenges`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.challenges)).toBe(true);
      
      if (data.challenges.length > 0) {
        const challenge = data.challenges[0];
        expect(challenge).toHaveProperty('id');
        expect(challenge).toHaveProperty('title');
        expect(challenge).toHaveProperty('description');
        expect(challenge).toHaveProperty('reward_points');
        expect(challenge).toHaveProperty('type');
        expect(typeof challenge.id).toBe('string');
        expect(typeof challenge.title).toBe('string');
        expect(typeof challenge.description).toBe('string');
        expect(typeof challenge.reward_points).toBe('number');
        expect(typeof challenge.type).toBe('string');
      }
    });

    it('should return user stats with required fields', async () => {
      const response = await fetch(`${baseUrl}/api/gamification/challenges`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('user_stats');
      expect(typeof data.user_stats).toBe('object');
      
      const userStats = data.user_stats;
      expect(userStats).toHaveProperty('total_challenges_completed');
      expect(userStats).toHaveProperty('total_points_earned');
      expect(typeof userStats.total_challenges_completed).toBe('number');
      expect(typeof userStats.total_points_earned).toBe('number');
    });
  });
});
