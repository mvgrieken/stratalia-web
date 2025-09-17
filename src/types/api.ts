/**
 * API response types and interfaces
 */

// Common API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Search API types
export interface SearchResult {
  id: string;
  word: string;
  meaning: string;
  example: string;
  match_type: 'exact' | 'partial' | 'fallback';
  similarity_score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  message: string;
  suggestions: string[];
  total: number;
  source: 'database' | 'cache' | 'fallback';
}

// Translation API types
export interface TranslationRequest {
  text: string;
  direction: 'to_slang' | 'to_formal';
  context?: string;
}

export interface TranslationResponse {
  translation: string;
  confidence: number;
  alternatives: string[];
  explanation: string;
  etymology?: string;
  source?: string;
  error?: boolean;
  message?: string;
}

// Quiz API types
export interface QuizQuestion {
  id: string;
  word: string;
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResponse {
  questions: QuizQuestion[];
  total: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Knowledge API types
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'podcast' | 'infographic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  duration?: number;
  word_count?: number;
}

export interface KnowledgeResponse {
  items: KnowledgeItem[];
  total: number;
  filters?: {
    type?: string;
    difficulty?: string;
    category?: string;
  };
}

// Leaderboard API types
export interface LeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string;
  total_points: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  avatar_url?: string;
}

export interface LeaderboardResponse {
  users: LeaderboardUser[];
  total: number;
  stats: {
    totalUsers: number;
    averagePoints: number;
    highestStreak: number;
  };
}

// Auth API types
export interface AuthRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: 'user' | 'admin';
  };
  error?: string;
  message?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheStats {
  size: number;
  keys: string[];
  memoryUsage: number;
}

// Rate limiting types
export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  response?: Response;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  services: {
    database: 'up' | 'down' | 'unknown';
    cache: 'up' | 'down' | 'unknown';
    external: 'up' | 'down' | 'unknown';
  };
  timestamp: string;
  uptime: number;
}
