/**
 * Quiz Service - Business logic for quiz operations
 */

import { getSupabaseClient } from '@/lib/supabase-client';
import { mockDataService, MockQuizQuestion } from '@/lib/mock-data';
import { cacheService } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { AppError, Errors } from '@/lib/errors';

export interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswers: string[];
  wrongAnswers: Array<{
    question: string;
    selected: string;
    correct: string;
  }>;
}

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  startTime: number;
  endTime?: number;
  completed: boolean;
}

class QuizService {
  /**
   * Get quiz questions
   */
  async getQuizQuestions(
    difficulty?: 'easy' | 'medium' | 'hard',
    limit: number = 5
  ): Promise<QuizQuestion[]> {
    logger.info('Getting quiz questions', { difficulty, limit });

    // Check cache first
    const cacheKey = cacheService.generateKey('quiz', { difficulty, limit });
    const cachedResult = cacheService.get<QuizQuestion[]>(cacheKey);
    
    if (cachedResult) {
      logger.info('Quiz questions from cache', { count: cachedResult.length });
      return cachedResult;
    }

    // Try database first
    try {
      const supabase = getSupabaseClient();
      
      let query = supabase
        .from('quiz_questions')
        .select('id, word, question_text, correct_answer, wrong_answers, difficulty')
        .limit(limit);

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data: questions, error } = await query;

      if (!error && questions && questions.length > 0) {
        const results = questions.map(q => ({
          id: q.id,
          word: q.word,
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          wrong_answers: q.wrong_answers || [],
          difficulty: q.difficulty || 'medium'
        }));

        // Cache for 10 minutes
        cacheService.set(cacheKey, results, 10 * 60 * 1000);
        
        logger.info('Quiz questions from database', { count: results.length });
        return results;
      }
    } catch (dbError) {
      logger.warn('Database quiz questions failed, using fallback', { error: dbError });
    }

    // Fallback to mock data
    const mockQuestions = mockDataService.getQuizQuestions(difficulty, limit);
    const results = mockQuestions.map(q => ({
      id: q.id,
      word: q.word,
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      wrong_answers: q.wrong_answers,
      difficulty: q.difficulty
    }));

    // Cache fallback for shorter time (2 minutes)
    cacheService.set(cacheKey, results, 2 * 60 * 1000);

    logger.info('Quiz questions from fallback', { count: results.length });
    return results;
  }

  /**
   * Calculate quiz result
   */
  calculateResult(
    questions: QuizQuestion[],
    answers: Record<string, string>,
    timeTaken: number
  ): QuizResult {
    logger.info('Calculating quiz result', { 
      questionCount: questions.length, 
      answerCount: Object.keys(answers).length,
      timeTaken 
    });

    let score = 0;
    const correctAnswers: string[] = [];
    const wrongAnswers: Array<{
      question: string;
      selected: string;
      correct: string;
    }> = [];

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correct_answer) {
        score++;
        correctAnswers.push(question.word);
      } else {
        wrongAnswers.push({
          question: question.question_text,
          selected: userAnswer || 'Geen antwoord',
          correct: question.correct_answer
        });
      }
    });

    const percentage = Math.round((score / questions.length) * 100);
    const difficulty = this.calculateDifficulty(questions);

    const result: QuizResult = {
      score,
      totalQuestions: questions.length,
      percentage,
      timeTaken,
      difficulty,
      correctAnswers,
      wrongAnswers
    };

    logger.info('Quiz result calculated', { 
      score, 
      percentage, 
      difficulty 
    });

    return result;
  }

  /**
   * Calculate overall difficulty based on questions
   */
  private calculateDifficulty(questions: QuizQuestion[]): 'easy' | 'medium' | 'hard' {
    if (questions.length === 0) return 'medium';

    const difficultyCounts = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = questions.length;
    const hardRatio = (difficultyCounts.hard || 0) / total;
    const easyRatio = (difficultyCounts.easy || 0) / total;

    if (hardRatio >= 0.5) return 'hard';
    if (easyRatio >= 0.5) return 'easy';
    return 'medium';
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(): Promise<{
    totalQuestions: number;
    questionsByDifficulty: Record<string, number>;
    averageScore?: number;
  }> {
    logger.info('Getting quiz statistics');

    // Check cache first
    const cacheKey = 'quiz:stats';
    const cachedResult = cacheService.get(cacheKey);
    
    if (cachedResult) {
      logger.info('Quiz stats from cache');
      return cachedResult;
    }

    // Try database first
    try {
      const supabase = getSupabaseClient();
      
      const { data: questions, error } = await supabase
        .from('quiz_questions')
        .select('difficulty');

      if (!error && questions) {
        const stats = {
          totalQuestions: questions.length,
          questionsByDifficulty: questions.reduce((acc, q) => {
            const difficulty = q.difficulty || 'medium';
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };

        // Cache for 30 minutes
        cacheService.set(cacheKey, stats, 30 * 60 * 1000);
        
        logger.info('Quiz stats from database', stats);
        return stats;
      }
    } catch (dbError) {
      logger.warn('Database quiz stats failed, using fallback', { error: dbError });
    }

    // Fallback to mock data
    const allQuestions = mockDataService.getQuizQuestions();
    const stats = {
      totalQuestions: allQuestions.length,
      questionsByDifficulty: allQuestions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Cache fallback for 5 minutes
    cacheService.set(cacheKey, stats, 5 * 60 * 1000);

    logger.info('Quiz stats from fallback', stats);
    return stats;
  }

  /**
   * Save quiz result (for logged-in users)
   */
  async saveQuizResult(
    userId: string,
    result: QuizResult,
    questions: QuizQuestion[]
  ): Promise<void> {
    logger.info('Saving quiz result', { userId, score: result.score });

    try {
      const supabase = getSupabaseClient();
      
      const quizData = {
        user_id: userId,
        score: result.score,
        total_questions: result.totalQuestions,
        percentage: result.percentage,
        time_taken: result.timeTaken,
        difficulty: result.difficulty,
        questions: questions.map(q => ({
          question_id: q.id,
          word: q.word,
          difficulty: q.difficulty
        })),
        correct_answers: result.correctAnswers,
        wrong_answers: result.wrongAnswers,
        completed_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('quiz_results')
        .insert([quizData]);

      if (error) {
        logger.error('Failed to save quiz result', error);
        throw error;
      }

      logger.info('Quiz result saved successfully', { userId });
    } catch (error) {
      logger.error('Save quiz result failed', error);
      // Don't throw - this shouldn't break the quiz experience
    }
  }

  /**
   * Get user's quiz history
   */
  async getUserQuizHistory(userId: string, limit: number = 10): Promise<QuizResult[]> {
    logger.info('Getting user quiz history', { userId, limit });

    try {
      const supabase = getSupabaseClient();
      
      const { data: results, error } = await supabase
        .from('quiz_results')
        .select('score, total_questions, percentage, time_taken, difficulty, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to get quiz history', error);
        throw error;
      }

      const history = results?.map(r => ({
        score: r.score,
        totalQuestions: r.total_questions,
        percentage: r.percentage,
        timeTaken: r.time_taken,
        difficulty: r.difficulty,
        correctAnswers: [],
        wrongAnswers: []
      })) || [];

      logger.info('Quiz history retrieved', { userId, count: history.length });
      return history;
    } catch (error) {
      logger.error('Get quiz history failed', error);
      return [];
    }
  }
}

// Singleton instance
export const quizService = new QuizService();
