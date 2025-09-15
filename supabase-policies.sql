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

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Words are publicly viewable" ON words;
DROP POLICY IF EXISTS "words_select_all" ON words;
DROP POLICY IF EXISTS "words_insert_admin" ON words;

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

-- Drop existing policies
DROP POLICY IF EXISTS "anon_word_of_the_day_select" ON word_of_the_day;
DROP POLICY IF EXISTS "authenticated_word_of_the_day_select" ON word_of_the_day;
DROP POLICY IF EXISTS "word_of_the_day_select_all" ON word_of_the_day;

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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to word_variants" ON word_variants;

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
-- CONTENT_UPDATES TABLE - Public read access to approved content only
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "anon_content_updates_select" ON content_updates;
DROP POLICY IF EXISTS "authenticated_content_updates_select" ON content_updates;

-- Allow anonymous users to read approved content updates
CREATE POLICY "anon_content_updates_select_approved" ON content_updates
FOR SELECT
TO anon
USING (status = 'approved');

-- Allow authenticated users to read approved content updates
CREATE POLICY "authenticated_content_updates_select_approved" ON content_updates
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Allow service role full access to content updates
CREATE POLICY "service_content_updates_full_access" ON content_updates
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- MEDIA_ITEMS TABLE - Public read access to active items only
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active media items" ON media_items;

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
-- KNOWLEDGE_ARTICLES TABLE - Public read access to published articles only
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view published articles" ON knowledge_articles;

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
-- COACHING_EXERCISES TABLE - Public read access only
-- ==============================================

-- Drop existing policies
DROP POLICY IF EXISTS "coaching_exercises_select_anon" ON coaching_exercises;

-- Allow anonymous users to read coaching exercises
CREATE POLICY "anon_coaching_exercises_select" ON coaching_exercises
FOR SELECT
TO anon
USING (true);

-- Allow authenticated users to read coaching exercises
CREATE POLICY "authenticated_coaching_exercises_select" ON coaching_exercises
FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access to coaching exercises
CREATE POLICY "service_coaching_exercises_full_access" ON coaching_exercises
FOR ALL
TO service_role
USING (true);

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Verify that anon role has only SELECT permissions
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public' 
    AND 'anon' = ANY(roles) 
    AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
ORDER BY tablename, policyname;

-- This query should return NO results if security is properly configured

-- ==============================================
-- TEST QUERIES - VERIFY ANON ACCESS
-- ==============================================

-- Test 1: Words table access (should work)
-- SELECT COUNT(*) FROM words WHERE is_active = true;
-- Expected: Should return count of active words (currently 257)

-- Test 2: Word variants access (should work)
-- SELECT COUNT(*) FROM word_variants;
-- Expected: Should return count of word variants (currently 13)

-- Test 3: Word of the day access (should work)
-- SELECT COUNT(*) FROM word_of_the_day;
-- Expected: Should return count of daily words (currently 0)

-- Test 4: Content updates access (should work)
-- SELECT COUNT(*) FROM content_updates WHERE status = 'approved';
-- Expected: Should return count of approved content (currently 1)

-- Test 5: Verify anon cannot INSERT (should fail)
-- INSERT INTO words (word, definition, example, is_active) VALUES ('test', 'test', 'test', true);
-- Expected: Should fail with "new row violates row-level security policy" error

-- Test 6: Verify anon cannot UPDATE (should fail)
-- UPDATE words SET definition = 'updated' WHERE id = 1;
-- Expected: Should fail with "new row violates row-level security policy" error

-- Test 7: Verify anon cannot DELETE (should fail)
-- DELETE FROM words WHERE id = 1;
-- Expected: Should fail with "new row violates row-level security policy" error

-- ==============================================
-- VERIFICATION QUERY - NO ANON MUTATIONS
-- ==============================================
-- This query should return NO results if security is properly configured:
-- SELECT 
--     schemaname, 
--     tablename, 
--     policyname, 
--     roles, 
--     cmd, 
--     qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
--     AND 'anon' = ANY(roles) 
--     AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
-- ORDER BY tablename, policyname;

-- ==============================================
-- END OF SECURE RLS POLICIES
-- ==============================================
--
-- SUMMARY:
-- ========
-- - ANON: Only SELECT on public tables (words, word_variants, word_of_the_day, content_updates, etc.)
-- - AUTHENTICATED: Can manage their own user data + read public content
-- - SERVICE_ROLE: Full access to all tables for backend operations
-- - NO INSERT/UPDATE/DELETE permissions for anon role
-- - All data modifications must go through backend API with service_role
--
-- TO APPLY THESE POLICIES:
-- =======================
-- 1. Run this SQL file in Supabase SQL Editor
-- 2. Verify with the verification query above
-- 3. Test that APIs still work with anon key
-- 4. Verify that only service_role can modify data
--
-- ==============================================