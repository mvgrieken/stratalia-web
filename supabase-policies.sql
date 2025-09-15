-- Supabase RLS Policies for Stratalia App
-- This file contains all the Row Level Security policies needed for the app to work correctly

-- ==============================================
-- WORDS TABLE - Public read access for straattaal words
-- ==============================================

-- Allow anonymous and authenticated users to read active words
CREATE POLICY "Words are publicly viewable" ON words
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Allow all users (including service role) to read all words
CREATE POLICY "words_select_all" ON words
FOR SELECT
TO public
USING (true);

-- Allow service role to insert new words
CREATE POLICY "words_insert_admin" ON words
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- WORD_OF_THE_DAY TABLE - Daily word functionality
-- ==============================================

-- Allow all users to read daily words
CREATE POLICY "word_of_the_day_select_all" ON word_of_the_day
FOR SELECT
TO public
USING (true);

-- Allow anonymous users to insert daily words (for API functionality)
CREATE POLICY "word_of_the_day_insert_anon" ON word_of_the_day
FOR INSERT
TO anon
WITH CHECK (true);

-- ==============================================
-- WORD_VARIANTS TABLE - Word variants and alternatives
-- ==============================================

-- Allow all users to read word variants
CREATE POLICY "Allow read access to word_variants" ON word_variants
FOR SELECT
TO public
USING (true);

-- ==============================================
-- CONTENT_UPDATES TABLE - Community content submissions
-- ==============================================

-- Allow users to insert their own content submissions
CREATE POLICY "community_contributions_insert_own" ON community_contributions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own submissions and moderator reviews
CREATE POLICY "community_contributions_select_own" ON community_contributions
FOR SELECT
TO public
USING ((auth.uid() = user_id) OR (auth.uid() = moderator_id) OR (user_id IS NULL));

-- Allow moderators to update submissions
CREATE POLICY "community_contributions_update_moderator" ON community_contributions
FOR UPDATE
TO public
USING (auth.uid() = moderator_id);

-- ==============================================
-- PROFILES TABLE - User profiles
-- ==============================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT
TO public
USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE
TO public
USING (id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own_optimized" ON profiles
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- USER_PROGRESS TABLE - Learning progress tracking
-- ==============================================

-- Allow users to view their own progress
CREATE POLICY "user_progress_select_own_optimized" ON user_progress
FOR SELECT
TO public
USING ((SELECT auth.uid()) = user_id);

-- Allow users to update their own progress
CREATE POLICY "user_progress_update_own_optimized" ON user_progress
FOR UPDATE
TO public
USING ((SELECT auth.uid()) = user_id);

-- Allow users to insert their own progress
CREATE POLICY "user_progress_insert_own_optimized" ON user_progress
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- QUIZ_SESSIONS TABLE - Quiz functionality
-- ==============================================

-- Allow users to insert their own quiz sessions
CREATE POLICY "quiz_sessions_insert_own" ON quiz_sessions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own quiz sessions
CREATE POLICY "quiz_sessions_select_own" ON quiz_sessions
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- QUIZ_QUESTIONS TABLE - Quiz questions
-- ==============================================

-- Allow all users to read active quiz questions
CREATE POLICY "quiz_questions_select_all" ON quiz_questions
FOR SELECT
TO public
USING (is_active = true);

-- ==============================================
-- ACHIEVEMENTS TABLE - User achievements
-- ==============================================

-- Allow all users to view achievements
CREATE POLICY "Anyone can view achievements" ON achievements
FOR SELECT
TO public
USING (true);

-- Allow all users to view active achievements
CREATE POLICY "achievements_select_all" ON achievements
FOR SELECT
TO public
USING (is_active = true);

-- ==============================================
-- USER_ACHIEVEMENTS TABLE - User achievement tracking
-- ==============================================

-- Allow users to view their own achievements
CREATE POLICY "Users can view their own achievements" ON user_achievements
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to insert their own achievements
CREATE POLICY "Users can insert their own achievements" ON user_achievements
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- NEW_WORDS TABLE - New word submissions
-- ==============================================

-- Allow all users to read new word submissions
CREATE POLICY "new_words_select_all" ON new_words
FOR SELECT
TO public
USING (true);

-- Allow service role to insert new words
CREATE POLICY "new_words_insert_service" ON new_words
FOR INSERT
TO public
WITH CHECK (true);

-- Allow moderators to update new words
CREATE POLICY "new_words_update_moderator" ON new_words
FOR UPDATE
TO public
USING (auth.uid() = moderator_id);

-- ==============================================
-- SEARCH_HISTORY TABLE - Search tracking
-- ==============================================

-- Allow users to insert their own search history
CREATE POLICY "search_history_insert_own" ON search_history
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own search history
CREATE POLICY "search_history_select_own" ON search_history
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- TRANSLATION_HISTORY TABLE - Translation tracking
-- ==============================================

-- Allow users to insert their own translations
CREATE POLICY "translation_history_insert_own" ON translation_history
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own translations
CREATE POLICY "translation_history_select_own" ON translation_history
FOR SELECT
TO public
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- ==============================================
-- TRANSLATION_FEEDBACK TABLE - Translation feedback
-- ==============================================

-- Allow users to insert their own feedback
CREATE POLICY "translation_feedback_insert_own" ON translation_feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own feedback
CREATE POLICY "translation_feedback_select_own" ON translation_feedback
FOR SELECT
TO public
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- ==============================================
-- USER_ACTIVITIES TABLE - User activity tracking
-- ==============================================

-- Allow users to insert their own activities
CREATE POLICY "Users can insert own activities" ON user_activities
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own activities
CREATE POLICY "Users can view own activities" ON user_activities
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- USER_POINTS TABLE - Points system
-- ==============================================

-- Allow users to insert their own points
CREATE POLICY "Users can insert their own points" ON user_points
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own points
CREATE POLICY "Users can view their own points" ON user_points
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own points
CREATE POLICY "Users can update their own points" ON user_points
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- USER_FAVORITES TABLE - User favorites
-- ==============================================

-- Allow users to insert their own favorites
CREATE POLICY "user_favorites_insert_own" ON user_favorites
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own favorites
CREATE POLICY "user_favorites_select_own" ON user_favorites
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "user_favorites_delete_own" ON user_favorites
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- NOTIFICATIONS TABLE - User notifications
-- ==============================================

-- Allow users to manage their own notifications
CREATE POLICY "notifications_policy" ON notifications
FOR ALL
TO public
USING (user_id = auth.uid());

-- ==============================================
-- USERS TABLE - User management (Service role only)
-- ==============================================

-- Allow service role to manage all users
CREATE POLICY "Service role can manage users" ON users
FOR ALL
TO public
USING (true);

-- Allow users to view their own user record
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
TO public
USING (auth.uid() = id);

-- Allow users to update their own user record
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
TO public
USING (auth.uid() = id);

-- ==============================================
-- MEDIA_ITEMS TABLE - Media content
-- ==============================================

-- Allow all users to view active media items
CREATE POLICY "media_items_select_all" ON media_items
FOR SELECT
TO public
USING (is_active = true);

-- Allow anonymous users to view active media items
CREATE POLICY "Public can view active media items" ON media_items
FOR SELECT
TO anon
USING (is_active = true);

-- Allow authenticated users to view active media items
CREATE POLICY "Authenticated users can view media items" ON media_items
FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow authenticated users to insert media items
CREATE POLICY "Authenticated users can insert media items" ON media_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update media items
CREATE POLICY "Authenticated users can update media items" ON media_items
FOR UPDATE
TO authenticated
USING (true);

-- ==============================================
-- AUDIO_CONTENT TABLE - Audio content
-- ==============================================

-- Allow all users to read audio content
CREATE POLICY "Allow read access to audio_content" ON audio_content
FOR SELECT
TO public
USING (true);

-- ==============================================
-- MUSIC_LINKS TABLE - Music links
-- ==============================================

-- Allow all users to read music links
CREATE POLICY "Allow read access to music_links" ON music_links
FOR SELECT
TO public
USING (true);

-- ==============================================
-- LINK_VALIDATION_LOGS TABLE - Link validation
-- ==============================================

-- Allow all users to read link validation logs
CREATE POLICY "Allow read access to link_validation_logs" ON link_validation_logs
FOR SELECT
TO public
USING (true);

-- ==============================================
-- SCRAPING_SOURCES TABLE - Content scraping sources
-- ==============================================

-- Allow all users to read scraping sources
CREATE POLICY "scraping_sources_select_all" ON scraping_sources
FOR SELECT
TO public
USING (true);

-- Allow service role to insert scraping sources
CREATE POLICY "scraping_sources_insert_admin" ON scraping_sources
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins to update scraping sources
CREATE POLICY "scraping_sources_update_admin" ON scraping_sources
FOR UPDATE
TO public
USING (auth.uid() IN (SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'));

-- ==============================================
-- SCRAPING_LOGS TABLE - Scraping logs
-- ==============================================

-- Allow all users to read scraping logs
CREATE POLICY "scraping_logs_select_all" ON scraping_logs
FOR SELECT
TO public
USING (true);

-- Allow service role to insert scraping logs
CREATE POLICY "scraping_logs_insert_service" ON scraping_logs
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- LESSONS TABLE - Learning lessons
-- ==============================================

-- Allow all users to view lessons
CREATE POLICY "Anyone can view lessons" ON lessons
FOR SELECT
TO public
USING (true);

-- ==============================================
-- LESSON_PROGRESS TABLE - Lesson progress tracking
-- ==============================================

-- Allow users to insert their own lesson progress
CREATE POLICY "Users can insert their own lesson progress" ON lesson_progress
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to update their own lesson progress
CREATE POLICY "Users can update their own lesson progress" ON lesson_progress
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Allow users to view their own lesson progress
CREATE POLICY "Users can view their own lesson progress" ON lesson_progress
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- KNOWLEDGE_ARTICLES TABLE - Knowledge base
-- ==============================================

-- Allow all users to view published articles
CREATE POLICY "Public can view published articles" ON knowledge_articles
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Allow authenticated users to manage articles
CREATE POLICY "Authenticated users can manage articles" ON knowledge_articles
FOR ALL
TO authenticated
USING (true);

-- Allow users to view published articles or their own articles
CREATE POLICY "knowledge_articles_read_policy" ON knowledge_articles
FOR SELECT
TO public
USING ((status = 'published') OR (author_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- Allow users to manage their own articles or admins to manage all
CREATE POLICY "knowledge_articles_write_policy" ON knowledge_articles
FOR ALL
TO public
USING ((author_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- KNOWLEDGE_BASE_PROGRESS TABLE - Knowledge progress
-- ==============================================

-- Allow users to insert their own knowledge progress
CREATE POLICY "knowledge_progress_insert_own" ON knowledge_base_progress
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own knowledge progress
CREATE POLICY "knowledge_progress_select_own" ON knowledge_base_progress
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- USER_KNOWLEDGE_STATS TABLE - Knowledge statistics
-- ==============================================

-- Allow users to view their own knowledge stats
CREATE POLICY "Users can view own knowledge stats" ON user_knowledge_stats
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own knowledge stats
CREATE POLICY "Users can update own knowledge stats" ON user_knowledge_stats
FOR ALL
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- COACHING_EXERCISES TABLE - Coaching exercises
-- ==============================================

-- Allow anonymous users to read coaching exercises
CREATE POLICY "coaching_exercises_select_anon" ON coaching_exercises
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read coaching exercises
CREATE POLICY "coaching_exercises_select_authenticated" ON coaching_exercises
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert coaching exercises
CREATE POLICY "coaching_exercises_insert_authenticated" ON coaching_exercises
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update coaching exercises
CREATE POLICY "coaching_exercises_update_authenticated" ON coaching_exercises
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete coaching exercises
CREATE POLICY "coaching_exercises_delete_authenticated" ON coaching_exercises
FOR DELETE
TO authenticated
USING (true);

-- ==============================================
-- COACHING_MODULES TABLE - Coaching modules
-- ==============================================

-- Allow users to read published modules or their own modules
CREATE POLICY "coaching_modules_read_policy" ON coaching_modules
FOR SELECT
TO public
USING ((status = 'published') OR (author_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin', 'coach']))));

-- Allow users to manage their own modules or admins to manage all
CREATE POLICY "coaching_modules_write_policy" ON coaching_modules
FOR ALL
TO public
USING ((author_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- COACHING_RELATIONSHIPS TABLE - Coaching relationships
-- ==============================================

-- Allow users to manage their own coaching relationships
CREATE POLICY "coaching_relationships_policy" ON coaching_relationships
FOR ALL
TO public
USING ((auth.uid() = coach_id) OR (auth.uid() = coachee_id) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- COACHING_MESSAGES TABLE - Coaching messages
-- ==============================================

-- Allow users to manage messages in their coaching relationships
CREATE POLICY "coaching_messages_policy" ON coaching_messages
FOR ALL
TO public
USING ((EXISTS (SELECT 1 FROM coaching_relationships cr WHERE cr.id = coaching_messages.relationship_id AND (cr.coach_id = auth.uid() OR cr.coachee_id = auth.uid()))) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- EXERCISE_RESPONSES TABLE - Exercise responses
-- ==============================================

-- Allow users to manage their own exercise responses
CREATE POLICY "exercise_responses_policy" ON exercise_responses
FOR ALL
TO public
USING ((user_id = auth.uid()) OR (coach_id = auth.uid()) OR (EXISTS (SELECT 1 FROM coaching_relationships cr WHERE cr.coachee_id = exercise_responses.user_id AND cr.coach_id = auth.uid() AND cr.status = 'active')) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- USER_GOALS TABLE - User goals
-- ==============================================

-- Allow users to manage their own goals
CREATE POLICY "user_goals_policy" ON user_goals
FOR ALL
TO public
USING ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM coaching_relationships cr WHERE cr.coachee_id = user_goals.user_id AND cr.coach_id = auth.uid() AND cr.status = 'active')) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- USER_MODULE_PROGRESS TABLE - Module progress
-- ==============================================

-- Allow users to manage their own module progress
CREATE POLICY "user_module_progress_policy" ON user_module_progress
FOR ALL
TO public
USING ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM coaching_relationships cr WHERE cr.coachee_id = user_module_progress.user_id AND cr.coach_id = auth.uid() AND cr.status = 'active')) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- ==============================================
-- CONTENT_VIEWS TABLE - Content view tracking
-- ==============================================

-- Allow users to manage their own content views
CREATE POLICY "content_views_policy" ON content_views
FOR ALL
TO public
USING ((user_id = auth.uid()) OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['coach', 'admin']))));

-- ==============================================
-- DAILY_LOGS TABLE - Daily logging
-- ==============================================

-- Allow users to insert their own daily logs
CREATE POLICY "Users can insert their own daily logs" ON daily_logs
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own daily logs
CREATE POLICY "Users can view their own daily logs" ON daily_logs
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own daily logs
CREATE POLICY "Users can update their own daily logs" ON daily_logs
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Allow users to delete their own daily logs
CREATE POLICY "Users can delete their own daily logs" ON daily_logs
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- Allow demo user access to daily logs
CREATE POLICY "daily_logs_read_policy" ON daily_logs
FOR SELECT
TO public
USING ((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid));

-- Allow demo user access to daily logs
CREATE POLICY "daily_logs_update_policy" ON daily_logs
FOR UPDATE
TO public
USING ((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid));

-- Allow demo user access to daily logs
CREATE POLICY "daily_logs_delete_policy" ON daily_logs
FOR DELETE
TO public
USING ((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid));

-- Allow users to insert their own daily logs
CREATE POLICY "daily_logs_write_policy" ON daily_logs
FOR INSERT
TO public
WITH CHECK (true);

-- ==============================================
-- VOICE_JOURNALS TABLE - Voice journaling
-- ==============================================

-- Allow users to insert their own voice journals
CREATE POLICY "Users can insert their own voice journals" ON voice_journals
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own voice journals
CREATE POLICY "Users can view their own voice journals" ON voice_journals
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own voice journals
CREATE POLICY "Users can update their own voice journals" ON voice_journals
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Allow users to delete their own voice journals
CREATE POLICY "Users can delete their own voice journals" ON voice_journals
FOR DELETE
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- CHAT_MESSAGES TABLE - Chat functionality
-- ==============================================

-- Allow users to insert their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own chat messages
CREATE POLICY "Users can view their own chat messages" ON chat_messages
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- ==============================================
-- ASSESSMENTS TABLE - User assessments
-- ==============================================

-- Allow users to insert their own assessments
CREATE POLICY "Users can insert own assessments" ON assessments
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own assessments
CREATE POLICY "Users can view own assessments" ON assessments
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own assessments
CREATE POLICY "Users can update own assessments" ON assessments
FOR UPDATE
TO public
USING (auth.uid() = user_id);

-- Allow demo user access to assessments
CREATE POLICY "Demo user can access assessments" ON assessments
FOR ALL
TO public
USING (user_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- ==============================================
-- USER_PROFILES TABLE - User profile management
-- ==============================================

-- Allow users to manage their own profile
CREATE POLICY "Users can manage own profile" ON user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = id);

-- ==============================================
-- USER_WORD_PROGRESS TABLE - Word learning progress
-- ==============================================

-- Allow users to manage their own word progress
CREATE POLICY "Users can manage own word progress" ON user_word_progress
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- ==============================================
-- WORD_SUBMISSIONS TABLE - Word submissions
-- ==============================================

-- Allow users to manage their own word submissions
CREATE POLICY "Users can manage own submissions" ON word_submissions
FOR ALL
TO authenticated
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- ==============================================
-- COMMUNITY_SUBMISSIONS TABLE - Community submissions
-- ==============================================

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert submissions" ON community_submissions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view their own submissions
CREATE POLICY "Users can view own submissions" ON community_submissions
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to update their own pending submissions
CREATE POLICY "Users can update own pending submissions" ON community_submissions
FOR UPDATE
TO public
USING ((auth.uid() = user_id) AND (status = 'pending'));

-- ==============================================
-- SECURITY_CONFIG TABLE - Security configuration
-- ==============================================

-- Allow authenticated users to read security config
CREATE POLICY "security_config_select_authenticated" ON security_config
FOR SELECT
TO authenticated
USING (true);

-- ==============================================
-- SYSTEM_UPGRADES TABLE - System upgrades
-- ==============================================

-- Allow authenticated users to read system upgrades
CREATE POLICY "system_upgrades_select_authenticated" ON system_upgrades
FOR SELECT
TO authenticated
USING (true);

-- ==============================================
-- KNOWLEDGE_SCRAPING_LOGS TABLE - Knowledge scraping logs
-- ==============================================

-- Allow admins and moderators to manage knowledge scraping logs
CREATE POLICY "knowledge_scraping_logs_admin" ON knowledge_scraping_logs
FOR ALL
TO public
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin', 'moderator'])));

-- ==============================================
-- USER_SECURITY TABLE - User security settings
-- ==============================================

-- Allow users to view their own security settings
CREATE POLICY "user_security self select" ON user_security
FOR SELECT
TO public
USING (auth.uid() = user_id);

-- Allow users to view their own security settings (enhanced)
CREATE POLICY "user_security_select_own_enhanced" ON user_security
FOR SELECT
TO public
USING ((auth.uid() = user_id) AND (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_status = 'active')));

-- Allow users to view their own security settings (optimized)
CREATE POLICY "user_security_select_own_optimized" ON user_security
FOR SELECT
TO public
USING ((SELECT auth.uid()) = user_id);

-- Allow users to update their own security settings (enhanced)
CREATE POLICY "user_security_update_own_enhanced" ON user_security
FOR UPDATE
TO public
USING ((auth.uid() = user_id) AND (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.account_status = 'active')));

-- Allow users to update their own security settings (optimized)
CREATE POLICY "user_security_update_own_optimized" ON user_security
FOR UPDATE
TO public
USING ((SELECT auth.uid()) = user_id);

-- ==============================================
-- PROFILES TABLE - Enhanced profile policies
-- ==============================================

-- Allow users to view their own profile (enhanced)
CREATE POLICY "profiles_select_own_enhanced" ON profiles
FOR SELECT
TO public
USING ((auth.uid() = id) AND (account_status = 'active') AND (EXISTS (SELECT 1 FROM user_security WHERE user_security.user_id = auth.uid() AND (user_security.locked_until IS NULL OR user_security.locked_until < now()))));

-- Allow users to view their own profile (optimized)
CREATE POLICY "profiles_select_own_optimized" ON profiles
FOR SELECT
TO public
USING ((SELECT auth.uid()) = id);

-- Allow users to update their own profile (enhanced)
CREATE POLICY "profiles_update_own_enhanced" ON profiles
FOR UPDATE
TO public
USING ((auth.uid() = id) AND (account_status = 'active') AND (EXISTS (SELECT 1 FROM user_security WHERE user_security.user_id = auth.uid() AND (user_security.locked_until IS NULL OR user_security.locked_until < now()))));

-- Allow users to update their own profile (optimized)
CREATE POLICY "profiles_update_own_optimized" ON profiles
FOR UPDATE
TO public
USING ((SELECT auth.uid()) = id);

-- ==============================================
-- COMPANY-RELATED TABLES (for future use)
-- ==============================================

-- Companies table policies
CREATE POLICY "Users can view their own company" ON companies
FOR SELECT
TO public
USING (id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Company admins can update their company" ON companies
FOR UPDATE
TO public
USING (id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid() AND profiles.recruitment_role = ANY (ARRAY['admin', 'super_admin'])));

-- Jobs table policies
CREATE POLICY "Company users can view their company jobs" ON jobs
FOR SELECT
TO public
USING (company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));

CREATE POLICY "Company users can create jobs" ON jobs
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Company users can update their company jobs" ON jobs
FOR UPDATE
TO public
USING (company_id IN (SELECT profiles.company_id FROM profiles WHERE profiles.id = auth.uid()));

-- Applications table policies
CREATE POLICY "Company users can view applications for their jobs" ON applications
FOR SELECT
TO public
USING (job_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN profiles p ON j.company_id = p.company_id WHERE p.id = auth.uid()));

CREATE POLICY "Company users can manage applications" ON applications
FOR ALL
TO public
USING (job_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN profiles p ON j.company_id = p.company_id WHERE p.id = auth.uid()));

-- Interviews table policies
CREATE POLICY "Company users can view interviews for their applications" ON interviews
FOR SELECT
TO public
USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN profiles p ON j.company_id = p.company_id WHERE p.id = auth.uid()));

CREATE POLICY "Company users can manage interviews" ON interviews
FOR ALL
TO public
USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN profiles p ON j.company_id = p.company_id WHERE p.id = auth.uid()));

-- Candidates table policies
CREATE POLICY "Company users can view candidates" ON candidates
FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id IS NOT NULL));

CREATE POLICY "Company users can create candidates" ON candidates
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Company users can update candidates" ON candidates
FOR UPDATE
TO public
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id IS NOT NULL));

-- Candidate documents table policies
CREATE POLICY "Company users can view candidate documents" ON candidate_documents
FOR SELECT
TO public
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id IS NOT NULL));

CREATE POLICY "Company users can manage candidate documents" ON candidate_documents
FOR ALL
TO public
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id IS NOT NULL));

-- AI agent decisions table policies
CREATE POLICY "Company users can create AI decisions" ON ai_agent_decisions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Company users can view AI decisions for their applications" ON ai_agent_decisions
FOR SELECT
TO public
USING (application_id IN (SELECT a.id FROM applications a JOIN jobs j ON a.job_id = j.id JOIN profiles p ON j.company_id = p.company_id WHERE p.id = auth.uid()));

-- Audit log table policies
CREATE POLICY "Company users can view audit logs for their company" ON audit_log
FOR SELECT
TO public
USING (user_id IN (SELECT profiles.id FROM profiles WHERE profiles.company_id IN (SELECT profiles_1.company_id FROM profiles profiles_1 WHERE profiles_1.id = auth.uid())));

-- Company profiles table policies
CREATE POLICY "Company users can view company profiles" ON profiles
FOR SELECT
TO public
USING (company_id IN (SELECT profiles_1.company_id FROM profiles profiles_1 WHERE profiles_1.id = auth.uid()));

-- ==============================================
-- END OF POLICIES
-- ==============================================

-- Note: This file contains all the RLS policies needed for the Stratalia app
-- Make sure to apply these policies in your Supabase project
-- You can run this file using: psql -h your-db-host -U postgres -d postgres -f supabase-policies.sql
