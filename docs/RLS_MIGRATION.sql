/**
 * Supabase Row-Level Security (RLS) Migration
 * 
 * This migration sets up all RLS policies for the Quran Kids application.
 * Execute this script in your Supabase database to enforce data isolation
 * at the database layer.
 * 
 * BEFORE running this:
 * 1. Ensure all tables exist (profiles, goals, etc.)
 * 2. Ensure RLS is ENABLED on each table
 * 3. Test with multiple users to verify isolation
 * 
 * RLS must be enabled before policies take effect:
 * ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
 */

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Policy 1: Users can read their own profile (exact email match)
CREATE POLICY "users_can_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
);

-- Policy 2: Parents can read their own child profiles (hierarchical access)
CREATE POLICY "parents_can_read_child_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  parent_id IN (
    SELECT id FROM public.profiles 
    WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
  )
);

-- Policy 3: Users can update their own profile (exact email match)
CREATE POLICY "users_can_update_own_profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
)
WITH CHECK (
  email = auth.jwt() ->> 'email'
);

-- Policy 4: Parents can create child profiles (only if parent)
CREATE POLICY "parents_can_create_child_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  parent_id IN (
    SELECT id FROM public.profiles 
    WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
  )
  OR
  email = auth.jwt() ->> 'email'
);

-- Policy 5: Users can delete their own profile (only parent can delete self)
CREATE POLICY "users_can_delete_own_profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  email = auth.jwt() ->> 'email' AND type = 'parent'
);

-- ============================================================================
-- GOALS TABLE POLICIES
-- ============================================================================

-- Policy 1: Users can read goals for profiles they own or their children
CREATE POLICY "users_can_read_own_goals"
ON public.goals
FOR SELECT
TO authenticated
USING (
  profile_id IN (
    -- Goals for profiles where user IS the profile
    SELECT id FROM public.profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    -- Goals for child profiles (user is parent)
    SELECT id FROM public.profiles 
    WHERE parent_id IN (
      SELECT id FROM public.profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
);

-- Policy 2: Users can create goals for profiles they own or their children
CREATE POLICY "users_can_create_own_goals"
ON public.goals
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM public.profiles 
    WHERE parent_id IN (
      SELECT id FROM public.profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
);

-- Policy 3: Users can update goals they created (or parent can update children's goals)
CREATE POLICY "users_can_update_own_goals"
ON public.goals
FOR UPDATE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM public.profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM public.profiles 
    WHERE parent_id IN (
      SELECT id FROM public.profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM public.profiles 
    WHERE parent_id IN (
      SELECT id FROM public.profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
);

-- Policy 4: Users can delete goals they created
CREATE POLICY "users_can_delete_own_goals"
ON public.goals
FOR DELETE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM public.profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM public.profiles 
    WHERE parent_id IN (
      SELECT id FROM public.profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
);

-- ============================================================================
-- INDEXES (Critical for RLS Performance)
-- ============================================================================
-- Note: These queries may error if indexes already exist (that's OK)

-- Index on profiles.email (used in all RLS policies)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index on profiles.parent_id (used for parent-child lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_parent_id ON public.profiles(parent_id);

-- Index on goals.profile_id (used for goal filtering)
CREATE INDEX IF NOT EXISTS idx_goals_profile_id ON public.goals(profile_id);

-- ============================================================================
-- VERIFICATION QUERIES (Run after applying policies)
-- ============================================================================
-- These queries help verify RLS is working correctly

-- For testing, switch to a specific authenticated user:
-- SELECT auth.jwt() -> 'email'; -- Should show current authenticated user's email

-- Test 1: User should see their own profile
-- SELECT * FROM public.profiles WHERE email = 'test@example.com';
-- (Should return user's profile if authenticated as that user)

-- Test 2: User should NOT see other users' profiles
-- SELECT * FROM public.profiles;
-- (Should only return the authenticated user's profile, not others)

-- Test 3: Parent should see their children's profiles
-- SELECT * FROM public.profiles WHERE type = 'child' AND parent_id = '{parent_id}';
-- (Should return parent's children if authenticated as parent)

-- Test 4: Child user should see their own goals
-- SELECT * FROM public.goals WHERE profile_id = '{child_profile_id}';
-- (Should return goals if user owns the profile or is parent)

-- ============================================================================
-- NOTES ON RLS POLICY LOGIC
-- ============================================================================
-- 
-- Why use email as the key instead of user ID?
-- - Supabase Auth JWT includes email: auth.jwt() ->> 'email'
-- - Profiles table stores email for easy matching
-- - This creates user-profile association at DB level
-- 
-- Parent-child relationship:
-- - Parents are profiles with type = 'parent' and are auth users
-- - Children are profiles with type = 'child' and parent_id set
-- - Parent can access own profile + all own children
-- 
-- IMPORTANT: This RLS design assumes:
-- 1. One parent profile per authenticated email
-- 2. Auth email matches profile email exactly
-- 3. RLS is enabled before tests begin
-- 4. Policies are tested with real Supabase before production
-- 
-- Common mistakes:
-- - Forgetting to enable RLS on tables (policies won't work)
-- - Not creating indexes on filtered columns (performance degrades)
-- - Assuming RLS alone is enough (also validate on frontend)
-- - Not testing with multiple users (isolation failures hidden)
-- 
-- ============================================================================
