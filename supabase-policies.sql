-- ==============================================
-- SUPABASE RLS POLICIES - STRATALIA APP (SECURE VERSION)
-- ==============================================
--
-- SECURITY MODEL:
-- ===============
-- 1. ANON ROLE: Only SELECT permissions on public tables
--    - Can read: words, word_variants, word_of_the_day, content_updates
--    - Cannot: INSERT, UPDATE, DELETE anything
--    - Purpose: Public read-only access for frontend
--
-- 2. SERVICE_ROLE: Full permissions for backend operations
--    - Can: INSERT, UPDATE, DELETE on all tables
--    - Used only server-side in API routes
--    - Purpose: Backend data management
--
-- 3. AUTHENTICATED: Limited permissions for user data
--    - Can manage only their own records (profiles, progress, etc.)
--    - Cannot access system/admin tables
--    - Purpose: User-specific data management
--
-- PUBLIC TABLES (Read-only for anon):
-- ===================================
-- - words: Straattaal vocabulary
-- - word_variants: Alternative spellings/forms
-- - word_of_the_day: Daily featured words
-- - content_updates: Community content (read-only)
-- - media_items: Audio/video content (active only)
-- - achievements: Available achievements
-- - quiz_questions: Quiz content (active only)
-- - lessons: Learning lessons
-- - knowledge_articles: Published articles only
--
-- WHY ANON CANNOT INSERT/UPDATE/DELETE:
-- =====================================
-- 1. Security: Prevents unauthorized data modification
-- 2. Data integrity: Only backend can ensure data quality
-- 3. Audit trail: All changes go through controlled API endpoints
-- 4. Rate limiting: Backend can implement proper rate limiting
-- 5. Validation: Server-side validation ensures data consistency
--
-- ==============================================

-- ==============================================
-- WORDS TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read active words only
CREATE POLICY "anon_words_select_active" ON words
FOR SELECT
TO anon
USING (is_active = true);

-- Allow authenticated users to read all words
CREATE POLICY "authenticated_words_select_all" ON words
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to words
CREATE POLICY "service_words_full_access" ON words
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- WORD_OF_THE_DAY TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read daily words
CREATE POLICY "anon_word_of_the_day_select" ON word_of_the_day
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read daily words
CREATE POLICY "authenticated_word_of_the_day_select" ON word_of_the_day
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to daily words
CREATE POLICY "service_word_of_the_day_full_access" ON word_of_the_day
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- WORD_VARIANTS TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read word variants
CREATE POLICY "anon_word_variants_select" ON word_variants
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read word variants
CREATE POLICY "authenticated_word_variants_select" ON word_variants
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to word variants
CREATE POLICY "service_word_variants_full_access" ON word_variants
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- CONTENT_UPDATES TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read content updates
CREATE POLICY "anon_content_updates_select" ON community_contributions
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read content updates
CREATE POLICY "authenticated_content_updates_select" ON community_contributions
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to content updates
CREATE POLICY "service_content_updates_full_access" ON community_contributions
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- MEDIA_ITEMS TABLE - Public read access to active items only
-- ==============================================

-- Allow anonymous users to read active media items
CREATE POLICY "anon_media_items_select_active" ON media_items
FOR SELECT
TO anon
USING (is_active = true);

-- Allow authenticated users to read active media items
CREATE POLICY "authenticated_media_items_select_active" ON media_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow service role full access to media items
CREATE POLICY "service_media_items_full_access" ON media_items
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- ACHIEVEMENTS TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read active achievements
CREATE POLICY "anon_achievements_select_active" ON achievements
FOR SELECT
TO anon
USING (is_active = true);

-- Allow authenticated users to read all achievements
CREATE POLICY "authenticated_achievements_select_all" ON achievements
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to achievements
CREATE POLICY "service_achievements_full_access" ON achievements
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- QUIZ_QUESTIONS TABLE - Public read access to active questions only
-- ==============================================

-- Allow anonymous users to read active quiz questions
CREATE POLICY "anon_quiz_questions_select_active" ON quiz_questions
FOR SELECT
TO anon
USING (is_active = true);

-- Allow authenticated users to read all quiz questions
CREATE POLICY "authenticated_quiz_questions_select_all" ON quiz_questions
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to quiz questions
CREATE POLICY "service_quiz_questions_full_access" ON quiz_questions
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- LESSONS TABLE - Public read access only
-- ==============================================

-- Allow anonymous users to read lessons
CREATE POLICY "anon_lessons_select" ON lessons
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read lessons
CREATE POLICY "authenticated_lessons_select" ON lessons
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to lessons
CREATE POLICY "service_lessons_full_access" ON lessons
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- KNOWLEDGE_ARTICLES TABLE - Public read access to published articles only
-- ==============================================

-- Allow anonymous users to read published articles
CREATE POLICY "anon_knowledge_articles_select_published" ON knowledge_articles
FOR SELECT
TO anon
USING (status = 'published');

-- Allow authenticated users to read published articles
CREATE POLICY "authenticated_knowledge_articles_select_published" ON knowledge_articles
FOR SELECT
TO authenticated
USING (status = 'published');

-- Allow service role full access to knowledge articles
CREATE POLICY "service_knowledge_articles_full_access" ON knowledge_articles
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- USER-SPECIFIC TABLES - Authenticated users only
-- ==============================================

-- PROFILES TABLE
CREATE POLICY "authenticated_profiles_own" ON profiles
FOR ALL
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "service_profiles_full_access" ON profiles
FOR ALL
TO service_role
USING (true);

-- USER_PROGRESS TABLE
CREATE POLICY "authenticated_user_progress_own" ON user_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_progress_full_access" ON user_progress
FOR ALL
TO service_role
USING (true);

-- QUIZ_SESSIONS TABLE
CREATE POLICY "authenticated_quiz_sessions_own" ON quiz_sessions
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_quiz_sessions_full_access" ON quiz_sessions
FOR ALL
TO service_role
USING (true);

-- USER_ACHIEVEMENTS TABLE
CREATE POLICY "authenticated_user_achievements_own" ON user_achievements
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_achievements_full_access" ON user_achievements
FOR ALL
TO service_role
USING (true);

-- SEARCH_HISTORY TABLE
CREATE POLICY "authenticated_search_history_own" ON search_history
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_search_history_full_access" ON search_history
FOR ALL
TO service_role
USING (true);

-- TRANSLATION_HISTORY TABLE
CREATE POLICY "authenticated_translation_history_own" ON translation_history
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_translation_history_full_access" ON translation_history
FOR ALL
TO service_role
USING (true);

-- TRANSLATION_FEEDBACK TABLE
CREATE POLICY "authenticated_translation_feedback_own" ON translation_feedback
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_translation_feedback_full_access" ON translation_feedback
FOR ALL
TO service_role
USING (true);

-- USER_ACTIVITIES TABLE
CREATE POLICY "authenticated_user_activities_own" ON user_activities
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_activities_full_access" ON user_activities
FOR ALL
TO service_role
USING (true);

-- USER_POINTS TABLE
CREATE POLICY "authenticated_user_points_own" ON user_points
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_points_full_access" ON user_points
FOR ALL
TO service_role
USING (true);

-- USER_FAVORITES TABLE
CREATE POLICY "authenticated_user_favorites_own" ON user_favorites
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_favorites_full_access" ON user_favorites
FOR ALL
TO service_role
USING (true);

-- NOTIFICATIONS TABLE
CREATE POLICY "authenticated_notifications_own" ON notifications
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_notifications_full_access" ON notifications
FOR ALL
TO service_role
USING (true);

-- LESSON_PROGRESS TABLE
CREATE POLICY "authenticated_lesson_progress_own" ON lesson_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_lesson_progress_full_access" ON lesson_progress
FOR ALL
TO service_role
USING (true);

-- DAILY_LOGS TABLE
CREATE POLICY "authenticated_daily_logs_own" ON daily_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_daily_logs_full_access" ON daily_logs
FOR ALL
TO service_role
USING (true);

-- VOICE_JOURNALS TABLE
CREATE POLICY "authenticated_voice_journals_own" ON voice_journals
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_voice_journals_full_access" ON voice_journals
FOR ALL
TO service_role
USING (true);

-- CHAT_MESSAGES TABLE
CREATE POLICY "authenticated_chat_messages_own" ON chat_messages
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_chat_messages_full_access" ON chat_messages
FOR ALL
TO service_role
USING (true);

-- ASSESSMENTS TABLE
CREATE POLICY "authenticated_assessments_own" ON assessments
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_assessments_full_access" ON assessments
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- SYSTEM TABLES - Service role only
-- ==============================================

-- USERS TABLE
CREATE POLICY "service_users_full_access" ON users
FOR ALL
TO service_role
USING (true);

-- NEW_WORDS TABLE
CREATE POLICY "service_new_words_full_access" ON new_words
FOR ALL
TO service_role
USING (true);

-- SCRAPING_SOURCES TABLE
CREATE POLICY "service_scraping_sources_full_access" ON scraping_sources
FOR ALL
TO service_role
USING (true);

-- SCRAPING_LOGS TABLE
CREATE POLICY "service_scraping_logs_full_access" ON scraping_logs
FOR ALL
TO service_role
USING (true);

-- AUDIO_CONTENT TABLE
CREATE POLICY "service_audio_content_full_access" ON audio_content
FOR ALL
TO service_role
USING (true);

-- MUSIC_LINKS TABLE
CREATE POLICY "service_music_links_full_access" ON music_links
FOR ALL
TO service_role
USING (true);

-- LINK_VALIDATION_LOGS TABLE
CREATE POLICY "service_link_validation_logs_full_access" ON link_validation_logs
FOR ALL
TO service_role
USING (true);

-- KNOWLEDGE_BASE_PROGRESS TABLE
CREATE POLICY "authenticated_knowledge_base_progress_own" ON knowledge_base_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_knowledge_base_progress_full_access" ON knowledge_base_progress
FOR ALL
TO service_role
USING (true);

-- USER_KNOWLEDGE_STATS TABLE
CREATE POLICY "authenticated_user_knowledge_stats_own" ON user_knowledge_stats
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_knowledge_stats_full_access" ON user_knowledge_stats
FOR ALL
TO service_role
USING (true);

-- SECURITY_CONFIG TABLE
CREATE POLICY "service_security_config_full_access" ON security_config
FOR ALL
TO service_role
USING (true);

-- SYSTEM_UPGRADES TABLE
CREATE POLICY "service_system_upgrades_full_access" ON system_upgrades
FOR ALL
TO service_role
USING (true);

-- KNOWLEDGE_SCRAPING_LOGS TABLE
CREATE POLICY "service_knowledge_scraping_logs_full_access" ON knowledge_scraping_logs
FOR ALL
TO service_role
USING (true);

-- USER_SECURITY TABLE
CREATE POLICY "authenticated_user_security_own" ON user_security
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_security_full_access" ON user_security
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- COACHING TABLES - Authenticated users only
-- ==============================================

-- COACHING_EXERCISES TABLE
CREATE POLICY "authenticated_coaching_exercises_select" ON coaching_exercises
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "service_coaching_exercises_full_access" ON coaching_exercises
FOR ALL
TO service_role
USING (true);

-- COACHING_MODULES TABLE
CREATE POLICY "authenticated_coaching_modules_select" ON coaching_modules
FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "service_coaching_modules_full_access" ON coaching_modules
FOR ALL
TO service_role
USING (true);

-- COACHING_RELATIONSHIPS TABLE
CREATE POLICY "authenticated_coaching_relationships_own" ON coaching_relationships
FOR ALL
TO authenticated
USING (auth.uid() = coach_id OR auth.uid() = coachee_id);

CREATE POLICY "service_coaching_relationships_full_access" ON coaching_relationships
FOR ALL
TO service_role
USING (true);

-- COACHING_MESSAGES TABLE
CREATE POLICY "authenticated_coaching_messages_own" ON coaching_messages
FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM coaching_relationships cr 
    WHERE cr.id = coaching_messages.relationship_id 
    AND (cr.coach_id = auth.uid() OR cr.coachee_id = auth.uid())
));

CREATE POLICY "service_coaching_messages_full_access" ON coaching_messages
FOR ALL
TO service_role
USING (true);

-- EXERCISE_RESPONSES TABLE
CREATE POLICY "authenticated_exercise_responses_own" ON exercise_responses
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_exercise_responses_full_access" ON exercise_responses
FOR ALL
TO service_role
USING (true);

-- USER_GOALS TABLE
CREATE POLICY "authenticated_user_goals_own" ON user_goals
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_goals_full_access" ON user_goals
FOR ALL
TO service_role
USING (true);

-- USER_MODULE_PROGRESS TABLE
CREATE POLICY "authenticated_user_module_progress_own" ON user_module_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_user_module_progress_full_access" ON user_module_progress
FOR ALL
TO service_role
USING (true);

-- CONTENT_VIEWS TABLE
CREATE POLICY "authenticated_content_views_own" ON content_views
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_content_views_full_access" ON content_views
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- COMMUNITY TABLES - Limited access
-- ==============================================

-- COMMUNITY_SUBMISSIONS TABLE
CREATE POLICY "authenticated_community_submissions_own" ON community_submissions
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_community_submissions_full_access" ON community_submissions
FOR ALL
TO service_role
USING (true);

-- WORD_SUBMISSIONS TABLE
CREATE POLICY "authenticated_word_submissions_own" ON word_submissions
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "service_word_submissions_full_access" ON word_submissions
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- END OF SECURE RLS POLICIES
-- ==============================================
--
-- SUMMARY:
-- ========
-- - ANON: Only SELECT on public tables (words, word_variants, word_of_the_day, etc.)
-- - AUTHENTICATED: Can manage their own user data + read public content
-- - SERVICE_ROLE: Full access to all tables for backend operations
-- - NO INSERT/UPDATE/DELETE permissions for anon role
-- - All data modifications must go through backend API with service_role
--
-- TO APPLY THESE POLICIES:
-- =======================
-- 1. Drop existing policies: DROP POLICY IF EXISTS "policy_name" ON table_name;
-- 2. Apply these new policies
-- 3. Test that APIs still work with anon key
-- 4. Verify that only service_role can modify data
--
-- ==============================================