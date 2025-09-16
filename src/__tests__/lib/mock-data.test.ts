import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockDataService } from '@/lib/mock-data';

describe('MockDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchWords', () => {
    it('should return exact matches', () => {
      const results = mockDataService.searchWords('skeer', 10);
      
      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('skeer');
      expect(results[0].match_type).toBe('fallback');
    });

    it('should return partial matches', () => {
      const results = mockDataService.searchWords('ske', 10);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].word).toContain('ske');
    });

    it('should return empty array for no matches', () => {
      const results = mockDataService.searchWords('nonexistent', 10);
      
      expect(results).toHaveLength(0);
    });

    it('should respect limit parameter', () => {
      const results = mockDataService.searchWords('a', 3);
      
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return all matches when limit is higher than available', () => {
      const results = mockDataService.searchWords('a', 100);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(100);
    });

    it('should handle empty query', () => {
      const results = mockDataService.searchWords('', 10);
      
      expect(results).toHaveLength(0);
    });

    it('should handle null query', () => {
      const results = mockDataService.searchWords(null as any, 10);
      
      expect(results).toHaveLength(0);
    });
  });

  describe('getDailyWord', () => {
    it('should return a daily word', () => {
      const word = mockDataService.getDailyWord();
      
      expect(word).toBeDefined();
      expect(word.word).toBeDefined();
      expect(word.meaning).toBeDefined();
      expect(word.example).toBeDefined();
      expect(word.etymology).toBeDefined();
    });

    it('should return consistent word for same day', () => {
      const word1 = mockDataService.getDailyWord();
      const word2 = mockDataService.getDailyWord();
      
      expect(word1).toEqual(word2);
    });

    it('should have all required properties', () => {
      const word = mockDataService.getDailyWord();
      
      expect(word).toHaveProperty('id');
      expect(word).toHaveProperty('word');
      expect(word).toHaveProperty('meaning');
      expect(word).toHaveProperty('example');
      expect(word).toHaveProperty('etymology');
      expect(word).toHaveProperty('audio_url');
    });
  });

  describe('quizQuestions', () => {
    it('should return quiz questions', () => {
      const questions = mockDataService.quizQuestions;
      
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    it('should have questions with all required properties', () => {
      const questions = mockDataService.quizQuestions;
      const question = questions[0];
      
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('word');
      expect(question).toHaveProperty('question_text');
      expect(question).toHaveProperty('correct_answer');
      expect(question).toHaveProperty('wrong_answers');
      expect(question).toHaveProperty('difficulty');
    });

    it('should have valid difficulty levels', () => {
      const questions = mockDataService.quizQuestions;
      const difficulties = questions.map(q => q.difficulty);
      
      expect(difficulties.every(d => ['easy', 'medium', 'hard'].includes(d))).toBe(true);
    });

    it('should have wrong answers as arrays', () => {
      const questions = mockDataService.quizQuestions;
      
      questions.forEach(question => {
        expect(Array.isArray(question.wrong_answers)).toBe(true);
        expect(question.wrong_answers.length).toBeGreaterThan(0);
      });
    });
  });

  describe('knowledgeItems', () => {
    it('should return knowledge items', () => {
      const items = mockDataService.knowledgeItems;
      
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should have items with all required properties', () => {
      const items = mockDataService.knowledgeItems;
      const item = items[0];
      
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('content');
      expect(item).toHaveProperty('type');
      expect(item).toHaveProperty('level');
      expect(item).toHaveProperty('tags');
    });

    it('should have valid types', () => {
      const items = mockDataService.knowledgeItems;
      const types = items.map(item => item.type);
      
      expect(types.every(t => ['article', 'video', 'podcast', 'infographic'].includes(t))).toBe(true);
    });

    it('should have valid levels', () => {
      const items = mockDataService.knowledgeItems;
      const levels = items.map(item => item.level);
      
      expect(levels.every(l => ['beginner', 'intermediate', 'advanced'].includes(l))).toBe(true);
    });

    it('should have tags as arrays', () => {
      const items = mockDataService.knowledgeItems;
      
      items.forEach(item => {
        expect(Array.isArray(item.tags)).toBe(true);
      });
    });
  });

  describe('leaderboardUsers', () => {
    it('should return leaderboard users', () => {
      const users = mockDataService.leaderboardUsers;
      
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    it('should have users with all required properties', () => {
      const users = mockDataService.leaderboardUsers;
      const user = users[0];
      
      expect(user).toHaveProperty('user_id');
      expect(user).toHaveProperty('display_name');
      expect(user).toHaveProperty('total_points');
      expect(user).toHaveProperty('level');
      expect(user).toHaveProperty('current_streak');
      expect(user).toHaveProperty('longest_streak');
      expect(user).toHaveProperty('rank');
    });

    it('should have valid point values', () => {
      const users = mockDataService.leaderboardUsers;
      
      users.forEach(user => {
        expect(typeof user.total_points).toBe('number');
        expect(user.total_points).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid streak values', () => {
      const users = mockDataService.leaderboardUsers;
      
      users.forEach(user => {
        expect(typeof user.current_streak).toBe('number');
        expect(user.current_streak).toBeGreaterThanOrEqual(0);
        expect(typeof user.longest_streak).toBe('number');
        expect(user.longest_streak).toBeGreaterThanOrEqual(0);
        expect(user.longest_streak).toBeGreaterThanOrEqual(user.current_streak);
      });
    });

    it('should have valid rank values', () => {
      const users = mockDataService.leaderboardUsers;
      
      users.forEach(user => {
        expect(typeof user.rank).toBe('number');
        expect(user.rank).toBeGreaterThan(0);
      });
    });
  });

  describe('challenges', () => {
    it('should return challenges', () => {
      const challenges = mockDataService.challenges;
      
      expect(challenges).toBeDefined();
      expect(Array.isArray(challenges)).toBe(true);
      expect(challenges.length).toBeGreaterThan(0);
    });

    it('should have challenges with all required properties', () => {
      const challenges = mockDataService.challenges;
      const challenge = challenges[0];
      
      expect(challenge).toHaveProperty('id');
      expect(challenge).toHaveProperty('title');
      expect(challenge).toHaveProperty('description');
      expect(challenge).toHaveProperty('type');
      expect(challenge).toHaveProperty('points');
      expect(challenge).toHaveProperty('difficulty');
    });

    it('should have valid challenge types', () => {
      const challenges = mockDataService.challenges;
      const types = challenges.map(c => c.type);
      
      expect(types.every(t => ['daily', 'weekly', 'monthly', 'special'].includes(t))).toBe(true);
    });

    it('should have valid difficulty levels', () => {
      const challenges = mockDataService.challenges;
      const difficulties = challenges.map(c => c.difficulty);
      
      expect(difficulties.every(d => ['easy', 'medium', 'hard'].includes(d))).toBe(true);
    });

    it('should have valid point values', () => {
      const challenges = mockDataService.challenges;
      
      challenges.forEach(challenge => {
        expect(typeof challenge.points).toBe('number');
        expect(challenge.points).toBeGreaterThan(0);
      });
    });
  });

  describe('communitySubmissions', () => {
    it('should return community submissions', () => {
      const submissions = mockDataService.communitySubmissions;
      
      expect(submissions).toBeDefined();
      expect(Array.isArray(submissions)).toBe(true);
      expect(submissions.length).toBeGreaterThan(0);
    });

    it('should have submissions with all required properties', () => {
      const submissions = mockDataService.communitySubmissions;
      const submission = submissions[0];
      
      expect(submission).toHaveProperty('id');
      expect(submission).toHaveProperty('word');
      expect(submission).toHaveProperty('meaning');
      expect(submission).toHaveProperty('example');
      expect(submission).toHaveProperty('submitted_by');
      expect(submission).toHaveProperty('status');
      expect(submission).toHaveProperty('created_at');
    });

    it('should have valid status values', () => {
      const submissions = mockDataService.communitySubmissions;
      const statuses = submissions.map(s => s.status);
      
      expect(statuses.every(s => ['pending', 'approved', 'rejected'].includes(s))).toBe(true);
    });
  });
});
