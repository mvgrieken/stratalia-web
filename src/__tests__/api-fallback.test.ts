import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
};

vi.mock('@/lib/config', () => ({
  config: {
    supabase: {
      url: mockEnv.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: mockEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    app: {
      url: 'http://localhost:3000',
      name: 'Stratalia',
      isProduction: false
    }
  },
  isSupabaseConfigured: () => true
}));

describe('API Fallback Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search API', () => {
    it('should return fallback data when database fails', async () => {
      const response = await fetch('/api/words/search?query=skeer');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('word');
      expect(data[0]).toHaveProperty('meaning');
    });

    it('should handle empty query gracefully', async () => {
      const response = await fetch('/api/words/search?query=');
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Daily Word API', () => {
    it('should return a daily word with fallback', async () => {
      const response = await fetch('/api/words/daily');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('word');
      expect(data).toHaveProperty('meaning');
      expect(data).toHaveProperty('example');
      expect(data).toHaveProperty('date');
    });
  });

  describe('Quiz API', () => {
    it('should return quiz questions with fallback', async () => {
      const response = await fetch('/api/quiz?difficulty=easy&limit=3');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('questions');
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBeGreaterThan(0);
      expect(data.questions[0]).toHaveProperty('question_text');
      expect(data.questions[0]).toHaveProperty('correct_answer');
    });
  });

  describe('Knowledge API', () => {
    it('should return knowledge items with fallback', async () => {
      const response = await fetch('/api/content/approved?type=article&limit=5');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0]).toHaveProperty('title');
      expect(data.items[0]).toHaveProperty('content');
    });
  });

  describe('Leaderboard API', () => {
    it('should return leaderboard data with fallback', async () => {
      const response = await fetch('/api/gamification/leaderboard?limit=5');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('leaderboard');
      expect(Array.isArray(data.leaderboard)).toBe(true);
      expect(data.leaderboard.length).toBeGreaterThan(0);
      expect(data.leaderboard[0]).toHaveProperty('full_name');
      expect(data.leaderboard[0]).toHaveProperty('total_points');
    });
  });

  describe('AI Translate API', () => {
    it('should translate text with fallback', async () => {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: 'skeer',
          direction: 'to_formal'
        })
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('translation');
      expect(data).toHaveProperty('confidence');
      expect(data).toHaveProperty('explanation');
    });

    it('should handle invalid input gracefully', async () => {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: '',
          direction: 'to_formal'
        })
      });
      
      expect(response.status).toBe(400);
    });
  });
});
