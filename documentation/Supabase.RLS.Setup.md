# Supabase RLS (Row Level Security) Setup Guide

This guide explains how to set up RLS policies to secure your data based on the authenticated user from Supabase Auth.

## Overview

RLS policies ensure that:
- Users can only access their own profiles and data
- Data is secure at the database level, not just the application level
- Policies are enforced even if someone tries to bypass the frontend

## Prerequisites

1. ✅ Users must be authenticated with Supabase Auth (`supabase.auth.signIn()`)
2. ✅ Profiles must be linked to Supabase Auth users via email
3. ✅ Tables need proper indexes for performance

## Enable RLS on Tables

Before creating policies, enable RLS on tables:

```sql
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Enable RLS on other tables as needed
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases_progress ENABLE ROW LEVEL SECURITY;
```

## Setup Profiles Table Policies

### Policy 1: Users can read their own profile
```sql
CREATE POLICY "users_can_read_own_profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
);
```

### Policy 2: Users can read child profiles (if they're the parent)
```sql
CREATE POLICY "parents_can_read_child_profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  parent_id = (
    SELECT id FROM profiles 
    WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
  )
);
```

### Policy 3: Users can update their own profile
```sql
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
```

### Policy 4: Parents can create child profiles
```sql
CREATE POLICY "parents_can_create_child_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  type = 'child' AND
  parent_id = (
    SELECT id FROM profiles 
    WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
  )
);
```

## Setup Goals Table Policies

### Policy 1: Users can read goals for profiles they own or their children
```sql
CREATE POLICY "users_can_read_own_goals"
ON public.goals
FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles
    WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM profiles
    WHERE parent_id = (
      SELECT id FROM profiles 
      WHERE email = auth.jwt() ->> 'email' AND type = 'parent'
    )
  )
);
```

### Policy 2: Users can create goals for their own profile
```sql
CREATE POLICY "users_can_create_own_goals"
ON public.goals
FOR INSERT
TO authenticated
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles
    WHERE email = auth.jwt() ->> 'email'
  )
);
```

### Policy 3: Users can update their own goals
```sql
CREATE POLICY "users_can_update_own_goals"
ON public.goals
FOR UPDATE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles
    WHERE email = auth.jwt() ->> 'email'
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles
    WHERE email = auth.jwt() ->> 'email'
  )
);
```

### Policy 4: Users can delete their own goals
```sql
CREATE POLICY "users_can_delete_own_goals"
ON public.goals
FOR DELETE
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM profiles
    WHERE email = auth.jwt() ->> 'email'
  )
);
```

## Create Required Indexes for Performance

Indexes prevent RLS policies from being slow:

```sql
-- Index for email lookups in profiles
CREATE INDEX idx_profiles_email
ON public.profiles(email)
WHERE email IS NOT NULL;

-- Index for parent_id lookups
CREATE INDEX idx_profiles_parent_id
ON public.profiles(parent_id);

-- Index for profile_id lookups in goals
CREATE INDEX idx_goals_profile_id
ON public.goals(profile_id);

-- Index for type column in profiles
CREATE INDEX idx_profiles_type
ON public.profiles(type);

-- Composite index for email + type
CREATE INDEX idx_profiles_email_type
ON public.profiles(email, type);
```

## Testing RLS Policies

### Test 1: Users can only see their own profile
```sql
-- As authenticated user with email 'areen.dev@example.test'
SELECT * FROM profiles 
WHERE type = 'parent';
-- Should return only Areen's profile

-- Try to access another user's profile (will be empty)
SELECT * FROM profiles 
WHERE email = 'aya@example.com';
-- Should return 0 rows
```

### Test 2: Goals are protected
```sql
-- Select goals for user's profile
SELECT * FROM goals 
WHERE profile_id IN (
  SELECT id FROM profiles 
  WHERE email = auth.jwt() ->> 'email'
);
-- Should return only user's goals
```

## Client-Side Usage

Once RLS policies are in place, use the authenticated client:

```typescript
import { supabase } from '@/lib/supabase';

// User must be authenticated
const { data: { user } } = await supabase.auth.getUser();

if (user) {
  // This query will automatically filter by RLS policies
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('type', 'parent');
    // Will only return user's own parent profile due to RLS
}
```

## Troubleshooting

### "Policy preventing INSERT"
- Check that `WITH CHECK` clause in INSERT policy matches `USING` clause
- Ensure user is authenticated
- Verify email matches in auth.jwt()

### "Permission denied" on SELECT
- Enable RLS on the table
- Create SELECT policy for authenticated users
- Check that USING clause matches user's data

### Slow queries
- Create indexes on columns used in RLS policies
- Avoid complex subqueries in RLS policies
- Use simple email-based matching instead of joins when possible

## Security Best Practices

1. **Always use authenticated users**: Never allow anonymous access to sensitive data
2. **Index email columns**: RLS policies use email lookups, so index them
3. **Test policies**: Use different accounts to test access control
4. **Regular audits**: Check who can access what data
5. **Avoid public data**: Use `private: true` for sensitive operations
6. **Monitor logs**: Check Supabase logs for unauthorized access attempts

## Migration from localStorage-based auth

If migrating from localStorage:

1. Ensure all users have Supabase Auth accounts
2. Link Auth users to profiles via email
3. Enable RLS on all sensitive tables
4. Update frontend to use `authService.signIn()`
5. Remove `localStorage.getItem('currentParentId')`
6. Test all operations with proper authentication

## Next Steps

1. ✅ Enable RLS on all sensitive tables
2. ✅ Create policies for your use case
3. ✅ Create indexes for performance
4. ✅ Test policies with different users
5. ✅ Update frontend to use AuthContext
6. ✅ Remove localStorage-based authentication
