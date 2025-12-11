# Development Mode Authentication

## Overview

In **development mode** (`npm run dev`), the application uses a **mock authentication fallback** instead of real Supabase Auth. This allows you to test the full application flow without setting up Supabase Auth users.

## How It Works

### Development Flow (Current)
```
User enters credentials
        ↓
Try real Supabase Auth
        ↓
If fails in development mode:
  - Check if email has a matching profile in database
  - If yes and password matches → create mock user
  - If no matching profile → deny login
        ↓
User is "logged in" with mock credentials
```

### Production Flow (When Real Auth is Ready)
```
User enters credentials
        ↓
Authenticate with real Supabase Auth
        ↓
Load profile from database
        ↓
User is logged in
```

## Valid Test Credentials

These credentials work in development mode because they have **matching profiles** in the Supabase database:

```
areen.dev@example.test / DevAreen!234   ✅ Works (Areen profile exists)
aya.dev@example.test / DevAya!678          ✅ Works (Aya profile exists)
```

## Why This Approach?

### Problems Solved
1. **Instant Testing** - No need to manually create Supabase Auth users
2. **Database Consistency** - Only allows login for profiles that exist in database
3. **Development Friendly** - Focus on features, not authentication setup
4. **Production Ready** - Can switch to real auth by creating Supabase Auth users

### Security Notes
- ✅ Development fallback is **ONLY active in dev mode**
- ✅ Production builds ignore mock credentials entirely
- ✅ Still validates against database profiles
- ✅ Real passwords not stored anywhere

## How to Test

### Option 1: Click Quick Login Buttons (Easiest)
1. Open Login page
2. Click **"Use Areen"** → Logs in as areen.dev@example.test
3. Click **"Use Aya (Parent)"** → Logs in as aya.dev@example.test

### Option 2: Manual Entry
1. Email: `areen.dev@example.test`
2. Password: `DevAreen!234`
3. Click "Sign In"

Both should show "Welcome [Name]" on the onboarding screen after login.

## What to Expect in Development Mode

### Login Page Shows
```
🔧 Development Mode - Test with Mock Auth

areen.dev@example.test / DevAreen!234
aya.dev@example.test / DevAya!678

These use development fallback auth (mock users for testing)
```

### Browser Console Shows
```
[AuthProvider] 🔧 DEVELOPMENT MODE: Using fallback authentication...
[authService] Using development fallback for: areen.dev@example.test
[authService] Development mode: Signed in user: areen.dev@example.test
```

## Moving to Production

When ready to use real Supabase Auth:

### Step 1: Create Auth Users
In Supabase Dashboard → Authentication → Users:
1. Create user: `areen.dev@example.test` / `[secure-password]`
2. Create user: `aya.dev@example.test` / `[secure-password]`
3. Mark as "Email Confirmed"

### Step 2: Ensure Profiles Exist
Verify profiles in database:
```sql
SELECT email, name FROM profiles WHERE type = 'parent';
```

Should return:
- areen.dev@example.test - Areen
- aya.dev@example.test - Aya

### Step 3: Remove Development Credentials
In `src/services/authService.ts`, remove/comment out:
```typescript
// const DEV_TEST_PASSWORDS = { ... };
// const isDevelopment = import.meta.env.DEV;
```

This forces real Supabase Auth in all environments.

### Step 4: Set Up RLS Policies
Database-level security requires RLS (Row Level Security) policies for protection.

## Errors You Might See

### Error: "Invalid login credentials"
- **In Development**: Email doesn't have a profile in database
- **Solution**: Only use `areen.dev@example.test` or `aya.dev@example.test`

### Error: "Email not confirmed"
- **In Development**: Shouldn't happen (mock auth ignores this)
- **In Production**: Email wasn't verified in Supabase Auth
- **Solution**: Confirm email in Supabase Dashboard

### Error: "Email not found"
- **Cause**: Email exists in auth but no profile in database
- **Solution**: Create profile with matching email

## Architecture

### Development Mode Files
- `src/services/authService.ts` - Contains DEV_TEST_PASSWORDS fallback
- `src/contexts/AuthContext.tsx` - Shows development warning
- `src/pages/Login.tsx` - Shows test credentials

### Development Helper (Not Currently Used)
- `src/services/authDevHelper.ts` - For future: creating real Supabase Auth users
- Marked as deprecated since we use mock auth fallback instead

## Environment Variable Check

The development fallback is enabled by:
```typescript
const isDevelopment = import.meta.env.DEV;
```

This is automatically:
- ✅ `true` when running `npm run dev`
- ✅ `false` in production builds
- ✅ `false` when running tests

## FAQ

### Q: Is this secure?
**A:** Yes, for development. The fallback is **ONLY in dev mode**. Production never uses these credentials.

### Q: Why not use real Supabase Auth now?
**A:** Saves setup time during development. Switch when ready for production.

### Q: Can I use different passwords?
**A:** In development mode, update `DEV_TEST_PASSWORDS` in `authService.ts`. In production, use Supabase Auth Dashboard.

### Q: What about new team members?
**A:** They just run `npm run dev` and can login with the test credentials immediately. No setup needed.

### Q: Does this affect users?
**A:** No. Production users must sign up and verify email via Supabase Auth.

## Summary

Development mode uses **mock authentication** to allow instant testing. The system:
- ✅ Authenticates against test credentials
- ✅ Validates profiles exist in database
- ✅ Shows clear development mode indicator
- ✅ Can switch to real Supabase Auth anytime
- ✅ Is completely invisible in production

**To test right now:**
1. Open Login page
2. Click "Use Areen" or "Use Aya (Parent)"
3. Should be logged in and see welcome message

That's it! No additional setup needed.
