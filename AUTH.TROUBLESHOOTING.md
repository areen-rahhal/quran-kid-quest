# Authentication Troubleshooting Guide

## Error: "Invalid login credentials"

### What This Means
The email/password combination doesn't exist in **Supabase Auth**. Even though profiles exist in the database, Supabase Auth users must be created separately.

### Quick Fix (Development)

1. **Open the Login page** in your app
2. **Look for the yellow "Setup Test Users" button** (visible only in development mode)
3. **Click it** to create all test users automatically
4. **Try logging in again**

The setup button creates these test users in Supabase Auth:
- `areenrahhal@gmail.com` / `password`
- `aya@testmail.com` / `123456`
- `ahmad@testmail.com` / `TestPass`
- `myadmin@google.com` / `123`

### Manual Setup (Production)

If the button doesn't work or you're in production:

#### Option A: Create users via Supabase Dashboard

1. Go to **Supabase Dashboard > Authentication > Users**
2. Click **Create new user**
3. Add each test user:
   ```
   Email: areenrahhal@gmail.com
   Password: password
   Auto-send invite: OFF (since we have a password)
   ```
4. Repeat for other users

#### Option B: Use Supabase Admin API

If you have admin privileges, you can create users programmatically:

```typescript
import { createClient } from '@supabase/supabase-js';

// Use admin key, not anon key
const adminClient = createClient(
  'https://your-project.supabase.co',
  'your-admin-service-role-key'
);

// Create user
await adminClient.auth.admin.createUser({
  email: 'areenrahhal@gmail.com',
  password: 'password',
  email_confirm: true,
  user_metadata: {
    full_name: 'Areen',
  },
});
```

## Why This Happens

### Architecture
```
┌─────────────────────────────────────────┐
│     Supabase Project                    │
│  ┌──────────────┐     ┌──────────────┐  │
│  │ Auth Service │     │   Database   │  │
│  │              │     │              │  │
│  │ auth_users   │     │ profiles     │  │
│  │ table        │     │ table        │  │
│  └──────────────┘     └──────────────┘  │
└─────────────────────────────────────────┘
     (separate systems)
```

**Supabase Auth** (left side) and **Database** (right side) are separate systems:
- **Auth users** are created via `supabase.auth.signUp()` or dashboard
- **Profiles** are created via `INSERT INTO profiles`
- They must be **linked by email**

### When You Get "Invalid login credentials"

```
User tries: areenrahhal@gmail.com / password
            ↓
AuthService.signIn() calls Supabase Auth
            ↓
Supabase Auth looks for this user
            ↓
❌ NOT FOUND in auth_users table
            ↓
Error: "Invalid login credentials"
```

The profile EXISTS in the database but the auth user DOESN'T.

## Verification Checklist

### ✅ Check Auth User Exists
```typescript
import { supabase } from '@/lib/supabase';

// Try to sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'areenrahhal@gmail.com',
  password: 'password',
});

if (error) {
  console.log('Auth user does NOT exist:', error.message);
} else {
  console.log('Auth user EXISTS:', data.user.email);
}
```

### ✅ Check Profile Exists
```sql
SELECT id, email, name FROM profiles WHERE email = 'areenrahhal@gmail.com';
```

### ✅ Check Emails Match
The profile email must match the auth user email:
```sql
-- Profile email
SELECT email FROM profiles WHERE name = 'Areen';

-- Should match the email used in signInWithPassword()
```

## Common Issues

### Issue 1: Auth user exists but still getting error
**Solution**: 
- Check password is exactly correct (case-sensitive, no spaces)
- Verify email is lowercase
- Make sure email is confirmed in Supabase Auth

### Issue 2: Setup button doesn't create users
**Solution**:
- Check browser console for errors
- Verify you're in development mode (`import.meta.env.DEV`)
- Try manual creation via Supabase Dashboard

### Issue 3: Login succeeds but profile doesn't load
**Solution**:
- Verify profile exists with matching email
- Check ProfileContext is receiving the authenticated user
- Check console logs for profile loading errors

### Issue 4: Different user's profile loads
**Solution**:
- Verify auth user email is correct
- Check profile email matches auth user email exactly
- Clear browser cache/localStorage
- Check RLS policies aren't blocking access

## Prevention for Future Users

When adding new users:

1. **Create Auth User First**
   ```typescript
   await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'secure-password'
   });
   ```

2. **Then Create Profile with Same Email**
   ```sql
   INSERT INTO profiles (email, name, type, ...)
   VALUES ('user@example.com', 'User Name', 'parent', ...);
   ```

3. **Link them by Email** - ProfileContext uses email to find profile

## Getting Help

If you still can't log in:

1. **Check browser console** - Look for specific error messages
2. **Check Supabase logs** - Dashboard > Logs > Auth
3. **Verify both user and profile exist** with matching email
4. **Test with correct email/password** - No typos or spaces

## Files Modified

| File | Purpose |
|------|---------|
| `src/services/authDevHelper.ts` | Setup test users for development |
| `src/pages/Login.tsx` | Added setup button |
| `Supabase.RLS.Setup.md` | Security policies |
| `AUTHENTICATION.SETUP.md` | Complete setup guide |

## Next Steps

✅ Click "Setup Test Users" button to create auth accounts  
✅ Try logging in with areenrahhal@gmail.com / password  
✅ Verify "Welcome Areen" appears on onboarding  
✅ Test other accounts  
✅ Read Supabase.RLS.Setup.md to implement security policies
