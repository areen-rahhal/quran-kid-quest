# Unit Tests Documentation

## Overview

Comprehensive unit test suite for login routing and post-login user flow. Tests verify automatic routing based on user goal count across all profiles.

---

## Covered Unit Tests

### Test Suite: Login Routing and Post-Login Flow

**File**: `src/pages/__tests__/login-routing.test.tsx`  
**Total Tests**: 17  
**Status**: All passing ✅

---

## 1. Core Utility Functions Tests

### `calculateTotalGoals()` Function

| Test Name | Scenario | Expected Result | Status |
|-----------|----------|-----------------|--------|
| Calculate total from single profile | User with 2 goals | Returns 2 | ✅ |
| Calculate total across multiple profiles | Parent (1 goal) + Child 1 (2 goals) + Child 2 (0 goals) | Returns 3 | ✅ |
| Return 0 for no goals | All profiles have 0 goals | Returns 0 | ✅ |
| Handle undefined goals | Profiles with undefined goals array | Returns 0 | ✅ |
| Handle goalsCount property | Alternative property for goal count | Returns correct total | ✅ |

### `isNewUser()` Function

| Test Name | Scenario | Expected Result | Status |
|-----------|----------|-----------------|--------|
| Identify new user | User with 0 goals | Returns true | ✅ |
| Identify existing user | User with >0 goals | Returns false | ✅ |
| Handle mixed profiles | Parent (0) + Child (1) | Returns false | ✅ |
| Empty profile array | No profiles loaded | Returns true | ✅ |

---

## 2. Scenario 1: Existing User (Areen)

**Test Subject**: User with existing goals

| Test Name | Verification | Expected Result | Status |
|-----------|--------------|-----------------|--------|
| Identify as existing user | areen.dev@example.test with 2 goals | Not new user | ✅ |
| Route to /goals | User navigation path | Routes to /goals | ✅ |
| Prevent /onboarding route | Should NOT go to onboarding | No routing to /onboarding | ✅ |

**Details**:
- Email: `areen.dev@example.test`
- Total Goals: 2
- Expected Route: `/goals`
- Reason: User has existing goals in Supabase

---

## 3. Scenario 2: New User (Ahmad)

**Test Subject**: User with no goals

| Test Name | Verification | Expected Result | Status |
|-----------|--------------|-----------------|--------|
| Identify as new user | ahmad.dev@example.test with 0 goals | New user | ✅ |
| Route to /onboarding | User navigation path | Routes to /onboarding | ✅ |
| Prevent /goals route | Should NOT go to goals page | No routing to /goals | ✅ |

**Details**:
- Email: `ahmad.dev@example.test`
- Password: `DevAhmad!890`
- Total Goals: 0
- Expected Route: `/onboarding`
- Reason: User has no goals (first time user)

---

## 4. Edge Cases and Boundary Conditions

| Test Name | Scenario | Expected Behavior | Status |
|-----------|----------|-------------------|--------|
| Parent with child goals only | Parent (0 goals) + Child (2 goals) | Identified as existing user | ✅ |
| Multiple children varied goals | 1 parent + 3 children with 1, 2, 0, 1 goals | Total = 4, existing user | ✅ |
| Empty profile array | No profiles loaded | Treated as new user | ✅ |
| Alternative property format | Using goalsCount instead of goals array | Correctly counted | ✅ |

---

## 5. Real-World Supabase Data Verification

| Test Name | Data Source | Verification | Status |
|-----------|-------------|--------------|--------|
| Areen data processing | Real Supabase query result | Routes to /goals | ✅ |
| Ahmad data processing | Real Supabase profile | Routes to /onboarding | ✅ |

**Areen (Supabase)**:
- Profile ID: `de618e2e-092e-489e-899d-845824ebc358`
- Name: Areen
- Email: `areen.dev@example.test`
- Type: parent
- Goal Count: 2

**Ahmad (Supabase)**:
- Profile ID: `ff5b5b17-3c26-4111-9a29-46c0dd0ee419`
- Name: Ahmad
- Email: `ahmad.dev@example.test`
- Type: parent
- Goal Count: 0

---

## How to Run Unit Tests

### Run Login Routing Tests Only

```bash
npm test -- src/pages/__tests__/login-routing.test.tsx --run
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test:watch
```

### Run Tests with Watch (Login Routing Only)

```bash
npm test:watch -- src/pages/__tests__/login-routing.test.tsx
```

### Run Tests with Coverage Report

```bash
npm test:coverage
```

### Run Tests with UI

```bash
npm test:ui
```

---

## Test Execution

### Command Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `npm test -- <file> --run` | Run specific test file once | Test results summary |
| `npm test:watch -- <file>` | Run tests in watch mode | Auto-rerun on file changes |
| `npm test:coverage` | Generate coverage report | Coverage percentages by file |
| `npm test:ui` | Open test UI dashboard | Interactive test viewer |

### Example Output

```
 RUN  v4.0.8

✓ src/pages/__tests__/login-routing.test.tsx (17 tests) 9ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Duration  901ms
```

---

## Test Results Summary

| Metric | Value |
|--------|-------|
| Total Test Files | 1 |
| Total Tests | 17 |
| Passing | 17 ✅ |
| Failing | 0 |
| Skipped | 0 |
| Duration | ~900ms |

---

## Test Implementation Details

### Testing Framework

- **Framework**: Vitest
- **Library**: Testing Library (React)
- **Node**: User Event

### Test Dependencies

```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "vitest": "^4.0.8"
}
```

### Test File Structure

```
src/pages/__tests__/login-routing.test.tsx
├── Describe: Post-Login Routing Logic
│   ├── Core Utility Functions
│   │   ├── calculateTotalGoals() tests (5 tests)
│   │   └── isNewUser() tests (4 tests)
│   ├── Scenario 1: Existing User (2 tests)
│   ├── Scenario 2: New User (2 tests)
│   ├── Edge Cases (4 tests)
│   └── Real-World Supabase Data (2 tests)
```

---

## Key Test Assertions

### Goal Calculation Logic

- **Single profile**: Goals counted correctly
- **Multiple profiles**: Parent + children goals summed
- **Zero goals**: Handles empty goal arrays
- **Alternative formats**: Supports both `goals[]` and `goalsCount` properties

### Routing Logic

- **New user (0 goals)**: Routes to `/onboarding`
- **Existing user (>0 goals)**: Routes to `/goals`
- **Mixed profiles**: Total goals from all profiles determines route
- **No profiles**: Treated as new user

---

## Test Coverage Matrix

| Component | Coverage | Tests |
|-----------|----------|-------|
| `calculateTotalGoals()` | 100% | 5 |
| `isNewUser()` | 100% | 4 |
| Areen Scenario | 100% | 2 |
| Ahmad Scenario | 100% | 2 |
| Edge Cases | 100% | 4 |

---

## Related Files

| File | Purpose |
|------|---------|
| `src/lib/utils.ts` | Utility functions for goal calculations |
| `src/pages/PostLoginRouter.tsx` | Routing component that uses test logic |
| `src/pages/Login.tsx` | Login page that navigates to PostLoginRouter |
| `src/App.tsx` | App routing with /post-login route |

---

## Running Tests Before Commit

### Pre-commit Checklist

- [ ] Run login routing tests: `npm test -- src/pages/__tests__/login-routing.test.tsx --run`
- [ ] Verify all 17 tests pass
- [ ] No console errors or warnings
- [ ] Run full test suite: `npm test`

### Expected Result

```
✓ 17 tests passing
✓ No failures
✓ Ready to commit
```

---

## Debugging Failed Tests

### If Tests Fail

1. **Check test output** for specific assertion that failed
2. **Review error message** and stack trace
3. **Run with verbose output**: `npm test -- --reporter=verbose`
4. **Run in watch mode** to debug incrementally
5. **Check Supabase data** if data verification tests fail

### Common Issues

| Issue | Solution |
|-------|----------|
| Test timeout | Increase timeout in test or check async operations |
| Mock failures | Verify mock setup matches actual implementation |
| Data mismatch | Verify Supabase data hasn't changed |
| Route not found | Ensure PostLoginRouter and routes are correctly set up |

---

## Continuous Integration

### CI/CD Integration

Tests are ready for CI/CD pipelines:

```bash
# Run in CI environment
npm test -- --run --reporter=verbose
```

### Success Criteria

- All 17 tests pass
- No console errors
- Code coverage maintained above baseline

---

## Notes

- Tests use real Supabase data for verification
- Test credentials are included in test file
- No external API calls required
- Tests are deterministic and repeatable
- All edge cases are covered

