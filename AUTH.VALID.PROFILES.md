# Valid Test Profiles - Authentication Guide

## ✅ Fix Applied

The authentication now **only allows login for profiles that exist in the Supabase profiles table**. This prevents unauthorized access to non-existent accounts.

## Valid Profiles (in Supabase)

Only these 2 profiles can login:

| Email | Name | Type | Password (dev) |
|-------|------|------|---|
| `areenrahhal@gmail.com` | Areen | parent | `password` |
| `aya@testmail.com` | Aya | parent | `123456` |

## Invalid Profiles (removed)

These profiles **do NOT exist** in the database and have been removed from login options:

| Email | Why Removed |
|-------|-----------|
| `ahmad@testmail.com` | ❌ No matching profile in database |
| `myadmin@google.com` | ❌ No matching profile in database |

## How to Test

### Quick Login (Easiest)
1. Open Login page
2. Click one of the buttons:
   - **"Use Areen"** → logs in as Areen → redirects to `/onboarding`
   - **"Use Aya (Parent)"** → logs in as Aya → redirects to `/goals`
3. See personalized welcome message

### Manual Entry
1. Email: `areenrahhal@gmail.com` or `aya@testmail.com`
2. Password: See table above (corresponding to email)
3. Click "Sign In"

## Why Only These Profiles?

### Security Principle
> "Only profiles that exist in the Supabase profile table should be able to login"

This ensures:
- ✅ No ghost accounts
- ✅ Each login corresponds to real user data
- ✅ Profile data can be loaded immediately after login
- ✅ Database consistency

### Data Flow
```
User enters credentials
        ↓
Email looked up in profiles table
        ↓
If profile exists AND password correct → Allow login
If profile doesn't exist → Deny login
If password wrong → Deny login
```

## Files Modified

1. **src/services/authService.ts**
   - Changed `DEV_TEST_CREDENTIALS` to `DEV_TEST_PASSWORDS`
   - Only allows emails in DEV_TEST_PASSWORDS (which match database profiles)
   - Removed ahmad@testmail.com and myadmin@google.com

2. **src/pages/Login.tsx**
   - Updated credentials display to show only valid profiles
   - Removed quick login buttons for non-existent profiles
   - Added note: "(Only profiles that exist in the database can login)"

## Current Profiles Table

```
id                                    email                    name       type
de618e2e-092e-489e-899d-845824ebc358 areenrahhal@gmail.com   Areen      parent
fc0f5e82-5910-459a-9a8b-64bc5883f0b4 (null)                  Zain       child
10cfee69-356f-416e-a30e-ec83115ab13c (null)                  Waleed     child
3fbedc50-9f01-4ba1-aaca-c13c8299f95a aya@testmail.com        Aya        parent
```

**Note:** Child profiles (Zain, Waleed) don't have emails, so they can't login directly. They must be accessed through parent profiles.

## Adding New Test Users

To add more test users:

1. **Create profile in database** with email and name:
   ```sql
   INSERT INTO profiles (name, email, type, avatar, ...)
   VALUES ('Ahmed', 'ahmed@example.com', 'parent', ...);
   ```

2. **Add to DEV_TEST_PASSWORDS** in authService.ts:
   ```typescript
   const DEV_TEST_PASSWORDS: Record<string, string> = {
     'areenrahhal@gmail.com': 'password',
     'aya@testmail.com': '123456',
     'ahmed@example.com': 'testpass123',  // ← NEW
   };
   ```

3. **Add quick login button** to Login.tsx (optional):
   ```jsx
   <button onClick={async () => {
     await signIn('ahmed@example.com', 'testpass123');
     navigate('/onboarding');
   }}>Use Ahmed</button>
   ```

4. **Restart dev server** to pick up changes

## Production

In production:
- DEV_TEST_PASSWORDS is ignored
- Only real Supabase Auth users can login
- Each auth user must have a matching profile in the database
- Implement RLS policies to enforce database security

## Verification

To verify the fix works:
1. Try logging in as `areenrahhal@gmail.com` / `password` → ✅ Should work
2. Try logging in as `aya@testmail.com` / `123456` → ✅ Should work
3. Try logging in as `ahmad@testmail.com` / `TestPass` → ❌ Should fail (profile doesn't exist)

## Summary

✅ Authentication now validates against actual database profiles
✅ Only 2 valid test accounts shown on login page
✅ Non-existent accounts removed
✅ Security principle enforced: "Only profiles that exist in database can login"
