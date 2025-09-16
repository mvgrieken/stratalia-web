-- Performance Indexes Migration
-- Adds indexes for frequently used queries to improve performance

-- Words table indexes
CREATE INDEX IF NOT EXISTS idx_words_word_lower ON words (LOWER(word));
CREATE INDEX IF NOT EXISTS idx_words_category ON words (category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words (difficulty);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words (created_at);
CREATE INDEX IF NOT EXISTS idx_words_updated_at ON words (updated_at);

-- Composite index for word search (most common query)
CREATE INDEX IF NOT EXISTS idx_words_search ON words (LOWER(word), category, difficulty);

-- Knowledge items indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_items_status ON knowledge_items (status);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_created_at ON knowledge_items (created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_updated_at ON knowledge_items (updated_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_user_id ON knowledge_items (user_id);

-- Composite index for approved content queries
CREATE INDEX IF NOT EXISTS idx_knowledge_items_approved ON knowledge_items (status, created_at) 
WHERE status = 'approved';

-- Quiz questions indexes
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions (active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_created_at ON quiz_questions (created_at);

-- Composite index for active quiz questions by difficulty
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active_difficulty ON quiz_questions (active, difficulty)
WHERE active = true;

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_created_at ON user_progress (created_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_type ON user_progress (type);

-- Composite index for user progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_type ON user_progress (user_id, type, created_at);

-- Quiz results indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results (user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results (created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results (score);

-- Composite index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_quiz_results_leaderboard ON quiz_results (user_id, score, created_at);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles (level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_points ON user_profiles (total_points);
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_streak ON user_profiles (current_streak);
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles (updated_at);

-- Composite index for leaderboard by period
CREATE INDEX IF NOT EXISTS idx_user_profiles_leaderboard ON user_profiles (total_points DESC, level DESC, current_streak DESC);

-- Daily words indexes
CREATE INDEX IF NOT EXISTS idx_daily_words_date ON daily_words (date);
CREATE INDEX IF NOT EXISTS idx_daily_words_created_at ON daily_words (created_at);

-- Community submissions indexes
CREATE INDEX IF NOT EXISTS idx_community_submissions_status ON community_submissions (status);
CREATE INDEX IF NOT EXISTS idx_community_submissions_user_id ON community_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_community_submissions_created_at ON community_submissions (created_at);

-- Composite index for pending submissions
CREATE INDEX IF NOT EXISTS idx_community_submissions_pending ON community_submissions (status, created_at)
WHERE status = 'pending';

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, read, created_at)
WHERE read = false;

-- Full-text search indexes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_words_fulltext ON words USING gin(to_tsvector('dutch', word || ' ' || COALESCE(definition, '') || ' ' || COALESCE(example, '')));
CREATE INDEX IF NOT EXISTS idx_knowledge_items_fulltext ON knowledge_items USING gin(to_tsvector('dutch', title || ' ' || COALESCE(content, '')));

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_words_active ON words (id) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_available ON quiz_questions (id) WHERE active = true AND difficulty IS NOT NULL;

-- Statistics and monitoring indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs (endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs (status_code);

-- Composite index for API performance monitoring
CREATE INDEX IF NOT EXISTS idx_api_logs_performance ON api_logs (endpoint, status_code, created_at);

-- Comments and feedback
COMMENT ON INDEX idx_words_search IS 'Composite index for word search queries - most frequently used';
COMMENT ON INDEX idx_knowledge_items_approved IS 'Partial index for approved content queries';
COMMENT ON INDEX idx_quiz_questions_active_difficulty IS 'Partial index for active quiz questions by difficulty';
COMMENT ON INDEX idx_user_profiles_leaderboard IS 'Composite index for leaderboard queries ordered by points, level, and streak';
COMMENT ON INDEX idx_words_fulltext IS 'Full-text search index for Dutch language word search';
COMMENT ON INDEX idx_community_submissions_pending IS 'Partial index for pending community submissions';
COMMENT ON INDEX idx_notifications_unread IS 'Partial index for unread notifications per user';
