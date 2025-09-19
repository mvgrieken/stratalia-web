import { NextRequest } from 'next/server';
import { quizService } from '@/services/QuizService';
import { createSuccessResponse, Errors, AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { withApiError, withZod } from '@/lib/api-wrapper';
import { z } from 'zod';

const querySchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  limit: z.string().optional().default('5')
});

export const GET = withApiError(withZod(querySchema, async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | undefined;
  const limit = parseInt(searchParams.get('limit') || '5');

  // Validate parameters
  if (limit < 1 || limit > 20) {
    throw new AppError(
      Errors.VALIDATION_ERROR.code,
      'Limit must be between 1 and 20',
      Errors.VALIDATION_ERROR.statusCode
    );
  }

  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    throw new AppError(
      Errors.VALIDATION_ERROR.code,
      'Difficulty must be easy, medium, or hard',
      Errors.VALIDATION_ERROR.statusCode
    );
  }

  logger.info(`Quiz questions request: difficulty=${difficulty || 'any'}, limit=${limit}`);

  // Use the QuizService for business logic
  const questions = await quizService.getQuizQuestions(difficulty, limit);

  if (questions.length === 0) {
    return createSuccessResponse({
      questions: [],
      message: 'Geen quiz vragen beschikbaar. Probeer het later opnieuw.',
      suggestions: ['Probeer een andere moeilijkheidsgraad', 'Controleer je internetverbinding']
    });
  }

  logger.info(`Quiz questions retrieved successfully: count=${questions.length}, difficulty=${difficulty || 'mixed'}`);

  return createSuccessResponse({
    questions,
    total: questions.length,
    difficulty: difficulty || 'mixed'
  }, 200, { 
    source: questions[0]?.id.startsWith('fallback') ? 'fallback' : 'database' 
  });
}));