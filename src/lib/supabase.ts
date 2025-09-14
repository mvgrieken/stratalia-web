import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://trrsgvxoylhcudtiimvb.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycnNndnhveWxoY3VkdGlpbXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTQ3OTIsImV4cCI6MjA3MTc3MDc5Mn0.PG4cDu5UVUwE4Kp7NejdTcxdJDypkpdpQSO97Ipl8kQ'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  throw new Error('Supabase configuration is incomplete')
}

console.log('✅ Supabase client initialized with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'stratalia-web@1.0.0',
    },
  },
})

// Database types based on existing Supabase schema
export interface Word {
  id: string
  word: string
  definition: string
  example?: string
  category?: string
  difficulty?: string
  origin?: string
  usage_frequency?: number
  is_active?: boolean
  created_at: string
  updated_at: string
  normalized_word?: string
  phonetic_primary?: string
  phonetic_secondary?: string
  audio_file_id?: string
  first_seen_year?: number
  last_seen_year?: number
  cultural_context?: string
}

export interface UserProfile {
  id: string
  display_name?: string
  avatar_url?: string
  total_points: number
  current_level: number
  current_streak: number
  longest_streak: number
  last_activity_at: string
  adaptive_level?: string
  created_at: string
  updated_at: string
}

export interface QuizSession {
  id: string
  user_id?: string
  score: number
  total_questions: number
  correct_answers: number
  time_taken?: number
  difficulty?: string
  completed_at: string
}

export interface UserFavorite {
  id: string
  user_id?: string
  media_item_id?: string
  created_at: string
  item_type?: string
}

export interface WordOfTheDay {
  id: string
  word_id?: string
  date: string
  created_at: string
}

export interface CommunitySubmission {
  id: string
  user_id?: string
  word: string
  definition: string
  example?: string
  context?: string
  source?: string
  status?: string
  moderator_notes?: string
  points_awarded?: number
  created_at: string
  updated_at: string
  moderated_at?: string
  moderated_by?: string
}
