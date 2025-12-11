# Login Routing Tests Documentation

## Overview
This document describes the automated integration tests for the login flow and post-login routing logic.

## Test File
- **Location**: `src/pages/__tests__/login-routing.test.tsx`
- **Test Framework**: Vitest
- **Total Tests**: 17
- **Status**: ✅ All passing

## Routing Logic

The system implements the following post-login routing:

```
User Login
    ↓
[Check total goals across all profiles]
    ↓
    ├─ 0 goals (new user) → /onboarding
    └─ >0 goals (existing user) → /goals
```

## Test Scenarios

### Scenario 1: Existing User (Areen)
**User**: `areen.dev@example.test`  
**Password**: `DevAreen!234` (dev password) or actual password in production  
**Goals**: 2 (exists across all profiles)  
**Expected Route**: `/goals`

#### Test Results:
✅ User identified as existing user (not new)  
✅ Correctly routes to `/goals` page  
✅ Does NOT route to `/onboarding` page

### Scenario 2: New User (Ahmad)
**User**: `ahmad.dev@example.test`  
**Password**: `DevAhmad!890`  
**Goals**: 0 (no goals across all profiles)  
**Expected Route**: `/onboarding`

#### Test Results:
✅ User identified as new user  
✅ Correctly routes to `/onboarding` page  
✅ Does NOT route to `/goals` page

## Test Coverage

### Core Utility Functions

#### `calculateTotalGoals(profiles: Profile[]): number`
Tests covered:
- ✅ Calculate total goals from single profile
- ✅ Calculate goals across multiple profiles (parent + children)
- ✅ Return 0 when all profiles have no goals
- ✅ Handle undefined/null goals arrays
- ✅ Handle profiles with `goalsCount` property instead of `goals` array

#### `isNewUser(profiles: Profile[]): boolean`
Tests covered:
- ✅ Return true for users with 0 goals (new user)
- ✅ Return false for users with >0 goals (existing user)
- ✅ Correctly handle mixed profiles (parent 0 goals + child with goals)

### Edge Cases

1. **Parent with 0 goals + Child with goals**
   - Total goals: counted from all profiles
   - Result: User identified as existing (not new)
   - ✅ PASS

2. **Multiple children with varying goal counts**
   - Parent: 1 goal
   - Child 1: 2 goals
   - Child 2: 0 goals
   - Child 3: 1 goal
   - Total: 4 goals
   - Result: Existing user
   - ✅ PASS

3. **Empty profile array**
   - Total goals: 0
   - Result: New user
   - ✅ PASS

4. **Profiles with goalsCount instead of goals array**
   - Alternative property handling
   - ✅ PASS

### Real-World Supabase Data Verification

#### Areen's Data (from Supabase):
```json
{
  "id": "de618e2e-092e-489e-899d-845824ebc358",
  "name": "Areen",
  "email": "areen.dev@example.test",
  "type": "parent",
  "goal_count": 2
}
```
- ✅ Correctly identified as existing user
- ✅ Routes to `/goals`

#### Ahmad's Data (created in Supabase):
```json
{
  "id": "ff5b5b17-3c26-4111-9a29-46c0dd0ee419",
  "name": "Ahmad",
  "email": "ahmad.dev@example.test",
  "type": "parent",
  "goals_count": 0
}
```
- ✅ Correctly identified as new user
- ✅ Routes to `/onboarding`

## Implementation Details

### Files Modified/Created

1. **src/lib/utils.ts** (Modified)
   - Added `calculateTotalGoals(profiles: Profile[]): number`
   - Added `isNewUser(profiles: Profile[]): boolean`

2. **src/pages/PostLoginRouter.tsx** (Created)
   - Checks total goals across all profiles
   - Routes based on `isNewUser()` result
   - Shows loading state while profiles are being fetched

3. **src/pages/Login.tsx** (Modified)
   - All login flows now navigate to `/post-login` instead of hardcoded routes
   - Removed email-based routing logic

4. **src/App.tsx** (Modified)
   - Added `/post-login` route that renders `PostLoginRouter`

5. **src/pages/__tests__/login-routing.test.tsx** (Created)
   - Comprehensive unit tests for routing logic
   - Real-world Supabase data verification

### Supabase Setup

#### Created Test User (Ahmad)
```sql
INSERT INTO profiles (id, name, email, type, avatar, achievements, goals_count)
VALUES (
  'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
  'Ahmad',
  'ahmad.dev@example.test',
  'parent',
  'avatar-bear',
  jsonb_build_object('stars', 0, 'streak', 0, 'recitations', 0, 'goalsCompleted', 0),
  0
)
```

- **Email**: ahmad.dev@example.test
- **Password**: DevAhmad!890
- **Initial Goals**: 0 (new user)
- **Profile ID**: ff5b5b17-3c26-4111-9a29-46c0dd0ee419

## Running the Tests

```bash
# Run all tests
npm test

# Run only login routing tests
npm test -- src/pages/__tests__/login-routing.test.tsx

# Run with coverage
npm test:coverage -- src/pages/__tests__/login-routing.test.tsx

# Run in watch mode
npm test:watch -- src/pages/__tests__/login-routing.test.tsx
```

## Test Output Example

```
 RUN  v4.0.8

✓ src/pages/__tests__/login-routing.test.tsx (17 tests)

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  06:14:34
   Duration  904ms
```

## Flow Diagram

### Login Flow
```
┌─────────────────────────────┐
│  Login Page (Login.tsx)      │
│  - Email & Password input   │
└──────────────┬──────────────┘
               │ signIn()
               ↓
┌─────────────────────────────┐
│  Auth Service               │
│  - Authenticate user        │
└──────────────┬──────────────┘
               │ success
               ↓
    /post-login (PostLoginRouter)
               │
         ┌─────┴─────┐
         ↓           ↓
    0 goals      >0 goals
         │           │
         ↓           ↓
    /onboarding   /goals
```

### Post-Login Router Logic
```typescript
const PostLoginRouter = () => {
  const { profiles, isLoading } = useProfile();

  useEffect(() => {
    if (isLoading) return;

    const newUser = isNewUser(profiles);
    
    if (newUser) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/goals", { replace: true });
    }
  }, [isLoading, profiles, navigate]);

  return <LoadingState />;
};
```

## Benefits

1. **Automatic Routing**: Users are automatically routed based on actual data
2. **No Hardcoding**: No email-based or manual routing logic
3. **Scalable**: Works with any number of profiles and goals
4. **Well-Tested**: 17 comprehensive tests covering edge cases
5. **User-Friendly**: New users see onboarding, returning users see their goals

## Future Enhancements

- Add E2E tests with Playwright or Cypress for full integration testing
- Add performance monitoring for profile loading
- Implement retry logic for failed profile loads
- Add analytics tracking for routing decisions

## Support

For issues or questions about the login routing implementation, refer to:
- `src/pages/PostLoginRouter.tsx` - Routing component
- `src/lib/utils.ts` - Utility functions
- `src/pages/__tests__/login-routing.test.tsx` - Test suite
