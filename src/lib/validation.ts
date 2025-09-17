/**
 * Input validation and sanitization using Zod
 * Ensures all user input is properly validated and sanitized
 */

import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Ongeldig e-mailadres')
  .min(5, 'E-mailadres moet minimaal 5 tekens lang zijn')
  .max(100, 'E-mailadres mag maximaal 100 tekens lang zijn')
  .toLowerCase()
  .trim();

// Password validation schema with complexity requirements
export const passwordSchema = z.string()
  .min(8, 'Wachtwoord moet minimaal 8 tekens lang zijn')
  .max(128, 'Wachtwoord mag maximaal 128 tekens lang zijn')
  .regex(/[a-z]/, 'Wachtwoord moet minimaal één kleine letter bevatten')
  .regex(/[A-Z]/, 'Wachtwoord moet minimaal één hoofdletter bevatten')
  .regex(/[0-9]/, 'Wachtwoord moet minimaal één cijfer bevatten')
  .regex(/[^a-zA-Z0-9]/, 'Wachtwoord moet minimaal één speciaal teken bevatten');

// User registration schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string()
    .min(2, 'Naam moet minimaal 2 tekens lang zijn')
    .max(100, 'Naam mag maximaal 100 tekens lang zijn')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Naam mag alleen letters, spaties, koppeltekens en apostrofes bevatten')
    .trim(),
  terms_accepted: z.boolean()
    .refine(val => val === true, 'Je moet akkoord gaan met de voorwaarden')
});

// User login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(1, 'Wachtwoord is verplicht')
    .max(128, 'Wachtwoord mag maximaal 128 tekens lang zijn')
});

// Search query schema
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Zoekterm is verplicht')
    .max(100, 'Zoekterm mag maximaal 100 tekens lang zijn')
    .trim()
    .transform(val => val.replace(/[<>\"'&]/g, '')), // Basic XSS protection
  limit: z.number()
    .int('Limit moet een geheel getal zijn')
    .min(1, 'Limit moet minimaal 1 zijn')
    .max(50, 'Limit mag maximaal 50 zijn')
    .default(10)
});

// Translation request schema
export const translationSchema = z.object({
  text: z.string()
    .min(1, 'Tekst is verplicht')
    .max(500, 'Tekst mag maximaal 500 tekens lang zijn')
    .trim()
    .transform(val => val.replace(/[<>\"'&]/g, '')), // Basic XSS protection
  direction: z.enum(['to_slang', 'to_formal'], {
    errorMap: () => ({ message: 'Ongeldige vertaalrichting' })
  }),
  context: z.string()
    .max(200, 'Context mag maximaal 200 tekens lang zijn')
    .optional()
    .transform(val => val ? val.replace(/[<>\"'&]/g, '') : undefined)
});

// Quiz submission schema
export const quizSubmissionSchema = z.object({
  score: z.number()
    .int('Score moet een geheel getal zijn')
    .min(0, 'Score moet minimaal 0 zijn')
    .max(100, 'Score mag maximaal 100 zijn'),
  total_questions: z.number()
    .int('Totaal aantal vragen moet een geheel getal zijn')
    .min(1, 'Er moet minimaal 1 vraag zijn')
    .max(50, 'Er mogen maximaal 50 vragen zijn'),
  time_taken: z.number()
    .int('Tijd moet een geheel getal zijn in milliseconden')
    .min(1000, 'Quiz moet minimaal 1 seconde duren')
    .max(3600000, 'Quiz mag maximaal 1 uur duren'), // 1 hour max
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    errorMap: () => ({ message: 'Ongeldige moeilijkheidsgraad' })
  })
});

// Community submission schema
export const communitySubmissionSchema = z.object({
  word: z.string()
    .min(1, 'Woord is verplicht')
    .max(50, 'Woord mag maximaal 50 tekens lang zijn')
    .regex(/^[a-zA-Z\s\-']+$/, 'Woord mag alleen letters, spaties, koppeltekens en apostrofes bevatten')
    .trim()
    .toLowerCase(),
  definition: z.string()
    .min(5, 'Definitie moet minimaal 5 tekens lang zijn')
    .max(500, 'Definitie mag maximaal 500 tekens lang zijn')
    .trim(),
  example: z.string()
    .min(5, 'Voorbeeld moet minimaal 5 tekens lang zijn')
    .max(300, 'Voorbeeld mag maximaal 300 tekens lang zijn')
    .trim()
    .optional(),
  context: z.string()
    .max(200, 'Context mag maximaal 200 tekens lang zijn')
    .trim()
    .optional(),
  source: z.string()
    .max(100, 'Bron mag maximaal 100 tekens lang zijn')
    .trim()
    .optional()
});

// Admin operations schema
export const adminOperationSchema = z.object({
  action: z.enum(['refresh_knowledge', 'update_user_role', 'moderate_submission'], {
    errorMap: () => ({ message: 'Ongeldige admin actie' })
  }),
  target_id: z.string()
    .uuid('Ongeldig ID formaat')
    .optional(),
  data: z.record(z.any())
    .optional()
});

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string, limit?: number) {
  return searchSchema.parse({ 
    query: query.trim(), 
    limit: limit || 10 
  });
}

/**
 * Validate user registration data
 */
export function validateRegistration(data: unknown) {
  return registerSchema.parse(data);
}

/**
 * Validate user login data
 */
export function validateLogin(data: unknown) {
  return loginSchema.parse(data);
}

/**
 * Validate translation request
 */
export function validateTranslation(data: unknown) {
  return translationSchema.parse(data);
}

/**
 * Validate quiz submission
 */
export function validateQuizSubmission(data: unknown) {
  return quizSubmissionSchema.parse(data);
}

/**
 * Validate community submission
 */
export function validateCommunitySubmission(data: unknown) {
  return communitySubmissionSchema.parse(data);
}

/**
 * Validate admin operation
 */
export function validateAdminOperation(data: unknown) {
  return adminOperationSchema.parse(data);
}

/**
 * Password strength checker
 */
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Minimaal 8 tekens');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Minimaal één kleine letter');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Minimaal één hoofdletter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Minimaal één cijfer');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Minimaal één speciaal teken');

  return {
    score,
    feedback,
    isValid: score >= 4
  };
}
