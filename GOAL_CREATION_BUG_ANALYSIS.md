# Goal Creation Bug Analysis

## Issue Description

When a new user logs in and creates a goal during onboarding, the goal is being added to a **different parent profile** instead of the logged-in user's profile.

**User Report:**
- User logged in as `areenrahhal@gmail.com`
- Navigated to onboarding
- Added goal "Surah Al-Bakarah"
- Goal does NOT appear in Supabase `goals` table for this user
- Goal appears in another parent's profile instead

## Root Cause Analysis

### The Problem Flow

```
1. User logs in via Login page
   ↓
2. ProfileContext.initializeProfiles() runs
   ↓
3. No savedParentId in localStorage (first login)
   ↓
4. loadProfiles() fetches ALL profiles from Supabase (NO FILTERING)
   ↓
5. First parent in the list is selected (might not be the logged-in user)
   ↓
6. Goal is added to wrong profile
```

### Code Location: `src/contexts/ProfileContext.tsx`

**Lines 91-130:**
```typescript
// Path 2: No savedParentId, need to load all profiles
console.log('[ProfileProvider] No saved parent ID, loading all profiles');
const allProfiles = await supabaseProfileService.loadProfiles(); // ← LOADS ALL PROFILES
// ...
// Find first parent from loaded profiles
const firstParent = allProfiles.find(p => p.type === 'parent'); // ← PICKS FIRST PARENT!
```

### Why This Happens

1. **No Real Authentication**: `Login.tsx` doesn't authenticate with Supabase Auth
   - It's a mock login that only routes based on email
   - No user session is created
   - System doesn't know which user is logged in

2. **No User-Profile Association**: Profiles in Supabase aren't linked to authenticated users
   - All profiles are loaded indiscriminately
   - First parent alphabetically or by creation time is selected
   - Wrong profile becomes `currentProfile`

3. **Goal Added to Wrong Profile**: When user adds goal:
   - `addGoal(currentProfile.id, ...)` uses the wrong profile ID
   - Goal gets saved to first parent, not logged-in user

## Files Involved

### Core Issue
- **`src/contexts/ProfileContext.tsx`** (lines 91-130)
  - Profile initialization logic
  - Loads all profiles without filtering
  - Picks first parent instead of correct user

- **`src/pages/Login.tsx`**
  - Mock login implementation
  - No Supabase Auth integration
  - Routes based on email string matching

### Recent Fixes
- **`src/pages/Onboarding.tsx`** (FIXED)
  - Now calls `addGoal()` when user selects a goal
  - Goal is persisted to Supabase before navigation

## Required Fixes

### Priority 1: Implement Real Supabase Authentication

```typescript
// Needed in src/lib/supabase.ts or new auth service
import { User } from '@supabase/supabase-js';

export async function getCurrentAuthenticatedUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getSession();
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
```

### Priority 2: Link Profiles to Authenticated Users

Create migration to add `user_id` to profiles table:

```sql
ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

Update RLS policy:
```sql
CREATE POLICY "Users can read only their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);
```

### Priority 3: Update Profile Loading

```typescript
// In supabaseProfileService.ts
async loadProfilesForCurrentUser(): Promise<Profile[]> {
  const { data: { user } } = await supabase.auth.getSession();
  
  if (!user) return [];
  
  // Only load profiles owned by current user
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
    
  return (data || []).map(convertDbProfileToProfile);
}
```

### Priority 4: Update ProfileContext Initialization

```typescript
// In ProfileContext.tsx
const currentUser = await getCurrentAuthenticatedUser();
if (!currentUser) {
  // Redirect to login
  return;
}

// Load only this user's profiles
const userProfiles = await supabaseProfileService.loadProfilesForCurrentUser();
```

## Test Cases Created

### 1. **Onboarding Tests** (`src/pages/__tests__/Onboarding.test.tsx`)
- Tests goal selection dropdown
- Tests Continue button behavior
- Tests loading state
- Tests navigation after goal creation
- Tests accessibility

### 2. **Profile Context Goal Addition Tests** (`src/contexts/__tests__/ProfileContext.addGoal.test.tsx`)
- Tests goal isolation between profiles
- Tests that goals don't cross profiles
- Tests current profile accuracy
- Tests duplicate goal prevention
- Tests parent profile context

### 3. **Integration Tests** (`src/services/__tests__/loginAndGoalIntegration.test.tsx`)
- **CRITICAL**: Tests goal added to correct profile after login
- **CRITICAL**: Tests goals isolated between multiple parents
- Tests profile state after login
- Tests multiple parents in database scenario
- Tests parent-child relationships

## How to Run Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- Onboarding.test.tsx
npm test -- ProfileContext.addGoal.test.tsx
npm test -- loginAndGoalIntegration.test.tsx

# Run with coverage
npm test -- --coverage
```

## Expected Test Results (Before Fix)

These tests will **FAIL** because:
- ProfileContext loads profiles without user filtering
- Wrong profile is selected as currentProfile
- Goals get added to wrong profile

## Expected Test Results (After Fix)

Once the fixes are implemented:
- ✅ Onboarding tests pass
- ✅ Goal isolation tests pass
- ✅ Login integration tests pass
- ✅ Goals are added only to logged-in user's profile

## Verification Checklist

- [ ] Implement Supabase Auth in Login page
- [ ] Create user_id column in profiles table
- [ ] Update RLS policies for user isolation
- [ ] Update ProfileContext to load only user's profiles
- [ ] Update goal loading to filter by user
- [ ] Run all test suites
- [ ] Verify goal appears in correct Supabase profile
- [ ] Test with multiple users
- [ ] Verify goals don't cross user boundaries

## Security Implications

**CRITICAL:** Without user-profile association:
- User A's goals can be modified/viewed by User B
- Privacy violation: data isolation is not enforced
- RLS policies are ineffective

Must implement proper authentication before production use.

## Next Steps

1. **Immediate**: Run test suites to confirm bug
2. **Short-term**: Implement Supabase Auth
3. **Medium-term**: Migrate profiles to user-authenticated design
4. **Verification**: All tests pass and manual testing confirms isolation
