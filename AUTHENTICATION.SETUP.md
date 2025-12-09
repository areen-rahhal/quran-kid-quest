# Supabase Authentication Setup Guide

This guide explains how to set up Supabase Authentication for your Quran Kids application.

## What Was Implemented

A complete authentication system using Supabase Auth with the following components:

1. **authService.ts** - Low-level Supabase Auth operations
2. **AuthContext.tsx** - React Context for global auth state
3. **Updated Login.tsx** - Real password validation with Supabase Auth
4. **Updated ProfileContext.tsx** - Links profiles to authenticated users
5. **RLS Policies** - Database-level security based on authenticated users

## Architecture Overview

```
User → Login Page → authService.signIn() → Supabase Auth
                                              ↓
                                        Creates Session
                                              ↓
                                        AuthContext notified
                                              ↓
                                        ProfileContext uses
                                        user.email to load profiles
```

## Step 1: Set Up Test Users in Supabase Auth

Navigate to **Dashboard > Authentication > Users** and create test users:

### Create Test User 1: Areen
```
Email: areenrahhal@gmail.com
Password: password (or any secure password)
Email verified: ✓ Confirm
```

### Create Test User 2: Aya (Parent)
```
Email: aya@testmail.com
Password: 123456
Email verified: ✓ Confirm
```

### Create Test User 3: Ahmad (New User)
```
Email: ahmad@testmail.com
Password: TestPass
Email verified: ✓ Confirm
```

### Create Test User 4: Admin
```
Email: myadmin@google.com
Password: 123
Email verified: ✓ Confirm
```

## Step 2: Link Profiles to Auth Users

Ensure profiles in the database have emails matching the auth users:

```sql
-- Check that profiles exist with matching emails
SELECT id, email, name, type FROM profiles;

-- If Areen's profile doesn't exist, create it
INSERT INTO profiles (name, email, type, avatar, goals_count, streak, achievements)
VALUES (
  'Areen',
  'areenrahhal@gmail.com',
  'parent',
  'avatar-avatar',
  0,
  0,
  jsonb_build_object(
    'stars', 0,
    'streak', 0,
    'recitations', 0,
    'goalsCompleted', 0
  )
);

-- Similar for other users...
```

## Step 3: Enable RLS on Tables

Enable Row Level Security on sensitive tables:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases_progress ENABLE ROW LEVEL SECURITY;
```

## Step 4: Create RLS Policies

See **Supabase.RLS.Setup.md** for complete RLS policy setup.

Quick setup for profiles:

```sql
-- Allow users to read their own profile
CREATE POLICY "users_can_read_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Allow users to read child profiles if they're the parent
CREATE POLICY "parents_can_read_child_profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    parent_id = (
      SELECT id FROM profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  );
```

## Step 5: Create Indexes for Performance

```sql
-- These indexes are critical for RLS policy performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_type ON public.profiles(type);
CREATE INDEX idx_profiles_parent_id ON public.profiles(parent_id);
CREATE INDEX idx_goals_profile_id ON public.goals(profile_id);
```

## Step 6: Test Authentication Flow

### Test 1: Sign In with Areen
1. Open Login page
2. Click "Use Areen"
3. Should see: Login success toast
4. Should be redirected to `/onboarding`
5. Onboarding should show: "Welcome Areen" in header

### Test 2: Sign In with Aya
1. Open Login page
2. Click "Use Aya (Parent)"
3. Should see: Login success toast
4. Should be redirected to `/goals` (because she has existing goals)

### Test 3: Invalid Password
1. Open Login page
2. Enter: `areenrahhal@gmail.com` / `wrongpassword`
3. Should see: Error message "Invalid login credentials"

### Test 4: Sign Out
1. After logging in, navigate to a protected page
2. Look for logout button (usually in header or navigation)
3. Click logout
4. Should be redirected to login page
5. User should be cleared from AuthContext

## Troubleshooting

### Issue: "Invalid login credentials"
**Solution**: Verify user exists in Supabase Auth and password is correct

### Issue: "Profile not found" on onboarding
**Solution**: Make sure profile exists in database with email matching auth user
```sql
SELECT * FROM profiles WHERE email = 'areenrahhal@gmail.com';
```

### Issue: "Permission denied" on goals query
**Solution**: RLS policies not set up correctly. Check:
1. RLS is enabled on goals table
2. SELECT policy exists for authenticated users
3. USING clause allows access to user's goals

### Issue: Authentication works but profile doesn't load
**Solution**: ProfileContext isn't getting the authenticated user properly
- Check that AuthProvider wraps the app
- Check that AppContent component receives user from useAuth()
- Check browser console for errors

### Issue: Slow authentication
**Solution**: Missing indexes on email column
```sql
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

## Security Checklist

- ✅ All users authenticated with Supabase Auth (not localStorage)
- ✅ Passwords validated server-side by Supabase
- ✅ Session tokens managed automatically
- ✅ RLS policies protect data at database level
- ✅ No plaintext passwords in code
- ✅ AuthContext properly clears data on logout
- ✅ ProfileContext depends on authenticated user

## File Changes Summary

| File | Change |
|------|--------|
| `src/services/authService.ts` | NEW - All Supabase Auth operations |
| `src/contexts/AuthContext.tsx` | NEW - Global auth state management |
| `src/pages/Login.tsx` | UPDATED - Use real authentication |
| `src/contexts/ProfileContext.tsx` | UPDATED - Linked to authenticated user |
| `src/App.tsx` | UPDATED - Added AuthProvider wrapper |
| `Supabase.RLS.Setup.md` | NEW - RLS policy guide |
| `AUTHENTICATION.SETUP.md` | NEW - This file |

## Next Steps

1. **Create test users in Supabase Auth** (Step 1)
2. **Link profiles to auth users** (Step 2)
3. **Enable RLS and create policies** (Steps 3-4)
4. **Create indexes** (Step 5)
5. **Test the flow** (Step 6)
6. **Remove deprecated localStorage auth code**

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase.Assistance.md](./Supabase.Assistance.md) - Realtime best practices
- [Supabase.RLS.Setup.md](./Supabase.RLS.Setup.md) - Detailed RLS policies
