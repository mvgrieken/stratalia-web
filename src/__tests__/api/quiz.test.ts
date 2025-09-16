import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/quiz/route';
import { quizService } from '@/services/QuizService';
import { applyRateLimit } from '@/middleware/rateLimiter';
// import { logger } from '@/lib/logger';

// Mock dependencies
vi.mock('@/services/QuizService');
vi.mock('@/middleware/rateLimiter');
vi.mock('@/lib/logger');

describe('/api/quiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return quiz questions successfully', async () => {
      const mockQuestions = [
        {
          id: '1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'geld', 'duur'],
          difficulty: 'easy' as const
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock quiz service
      vi.mocked(quizService.getQuizQuestions).mockResolvedValue(mockQuestions);

      const request = new NextRequest('http://localhost:3000/api/quiz?difficulty=easy&limit=5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.questions).toEqual(mockQuestions);
      expect(data.data.total).toBe(1);
      expect(quizService.getQuizQuestions).toHaveBeenCalledWith('easy', 5);
    });

    it('should use default parameters when not provided', async () => {
      const mockQuestions = [
        {
          id: '1',
          word: 'skeer',
          question_text: 'Wat betekent "skeer"?',
          correct_answer: 'arm, weinig geld hebben',
          wrong_answers: ['rijk', 'geld', 'duur'],
          difficulty: 'medium' as const
        }
      ];

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock quiz service
      vi.mocked(quizService.getQuizQuestions).mockResolvedValue(mockQuestions);

      const request = new NextRequest('http://localhost:3000/api/quiz');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(quizService.getQuizQuestions).toHaveBeenCalledWith('medium', 10);
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

      const request = new NextRequest('http://localhost:3000/api/quiz');
      const response = await GET(request);

      expect(response.status).toBe(429);
      expect(applyRateLimit).toHaveBeenCalledWith(request, 'quiz');
    });

    it('should handle quiz service errors', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock quiz service to throw error
      vi.mocked(quizService.getQuizQuestions).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/quiz');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('should validate difficulty parameter', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz?difficulty=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate limit parameter', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz?limit=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle maximum limit', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz?limit=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST', () => {
    it('should save quiz result successfully', async () => {
      const quizResult = {
        userId: 'user-1',
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        timeTaken: 120000,
        difficulty: 'medium' as const
      };

      const savedResult = {
        id: '1',
        ...quizResult,
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock quiz service
      vi.mocked(quizService.saveQuizResult).mockResolvedValue(savedResult);

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify(quizResult),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(savedResult);
      expect(quizService.saveQuizResult).toHaveBeenCalledWith(quizResult);
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

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          timeTaken: 120000,
          difficulty: 'medium'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(429);
      expect(applyRateLimit).toHaveBeenCalledWith(request, 'quiz');
    });

    it('should validate required fields', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          score: 8,
          totalQuestions: 10
          // Missing required fields
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate score range', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          score: -1, // Invalid score
          totalQuestions: 10,
          percentage: 80,
          timeTaken: 120000,
          difficulty: 'medium'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate percentage range', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          score: 8,
          totalQuestions: 10,
          percentage: 150, // Invalid percentage
          timeTaken: 120000,
          difficulty: 'medium'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle quiz service errors', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      // Mock quiz service to throw error
      vi.mocked(quizService.saveQuizResult).mockRejectedValue(new Error('Service error'));

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user-1',
          score: 8,
          totalQuestions: 10,
          percentage: 80,
          timeTaken: 120000,
          difficulty: 'medium'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('should handle invalid JSON', async () => {
      // Mock rate limiting
      vi.mocked(applyRateLimit).mockReturnValue({
        allowed: true,
        remaining: 100,
        resetTime: Date.now() + 3600000
      });

      const request = new NextRequest('http://localhost:3000/api/quiz', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
