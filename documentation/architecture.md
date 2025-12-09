# System Architecture

## 1) Overview

**Product**: Quran Kids - A learning management system designed to help children learn and memorize the Quran with guided progression, goal tracking, and achievement systems.

**Key Assumptions**:
- **Backend-first design**: All persistent data lives in Supabase PostgreSQL; localStorage used only for caching/offline fallback
- **Supabase-native authentication**: Expects Supabase Auth integration with email/password; development mode includes fallback testing credentials
- **RLS-enforced security**: Row-level security policies enforce user/organization scoping at database layer; anon key only for public endpoints; service role never exposed
- **Profile-based architecture**: Two profile types (parent/child) with hierarchical relationships; children linked to parent accounts
- **Cache-first strategy**: ProfileContext loads from localStorage first, then refreshes from Supabase in background to improve perceived performance

**Philosophy**:
- User data is sacred; all operations require explicit authentication
- Database is the source of truth; UI state is derived and cached
- Development experience matters; dev-mode fallback credentials for testing without Supabase Auth setup
- Graceful degradation; app continues with cached data if network fails
- Accessible multi-language design (Arabic/English) with RTL support

---

## 2) Tech Stack & Key Libraries

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18.3 + TypeScript | UI and state management |
| **Routing** | React Router v6 | Client-side navigation |
| **Forms & Validation** | React Hook Form + Zod | Type-safe form handling |
| **State Management** | React Context API + localStorage | App state and persistence |
| **UI Components** | shadcn/ui + Radix UI | Accessible, composable components |
| **Authentication** | Supabase Auth | Email/password with JWT sessions |
| **Database** | Supabase PostgreSQL | Profiles, goals, achievements |
| **Real-time** | Supabase Realtime (reserved) | Future real-time features |
| **HTTP Client** | @supabase/supabase-js | Managed client with RLS support |
| **Data Fetching** | TanStack React Query | Server state management (prepared, not yet used) |
| **Styling** | Tailwind CSS 3.4 + CSS Variables | Utility-first, dark mode ready |
| **Internationalization** | i18next + react-i18next | EN/AR translations with RTL |
| **Icons** | Lucide React | SVG icon library |
| **Animations** | Lottie React + tailwindcss-animate | Smooth motion for engagement |
| **Deployment** | Vite + SWC (Builder.io) | Fast HMR dev, optimized builds |
| **Testing** | Vitest + React Testing Library | Unit and integration tests |

**Key Dependencies**:
```
@supabase/supabase-js: v2.87.0 - Typed client for auth & queries
react-router-dom: v6.30.1 - SPA routing
i18next: v25.6.2 - i18n with lazy loading support
@tanstack/react-query: v5.83.0 - Server state (initialized, not yet used)
zod: v3.25.76 - Runtime type validation
react-hook-form: v7.61.1 - Form state + validation
```

---

## 3) Authentication & Authorization

### Session & Claims Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW (Development + Production)                  │
└─────────────────────────────────────────────────────────────────┘

DEV MODE:                          PRODUCTION MODE:
User → authService.signIn()        User → authService.signIn()
   ↓                                  ↓
Check Supabase Auth                Check Supabase Auth
   ↓                                  ↓
FAIL? ✓ (dev-only fallback)       FAIL ✗ (user must exist)
   ├─ Check DEV_TEST_PASSWORDS       
   ├─ Create mock JWT                SUCCEED ✓
   ├─ Store in localStorage        Store real JWT in session
   └─ Return mock session          Return Supabase session
                                       ↓
                                   Supabase reads auth header
                                   ↓ (attached to all requests)
                                   ✓ JWT decoded server-side
```

### Where Authorization Happens

| Layer | Mechanism | Coverage |
|-------|-----------|----------|
| **Frontend** | Context + URL checks | Route protection, UI conditional rendering |
| **Database** | RLS Policies | Primary enforcement point; prevents unauthorized data access |
| **API Calls** | JWT in Authorization header | Supabase client auto-attaches token |
| **Session Checks** | AuthContext + Supabase listener | Detects logout/expiry in real-time |

### Org/User Scoping

- **Parents** are root users; identified by `email` and `type = 'parent'`
- **Children** belong to parent; identified by `parent_id` foreign key
- **Goals** belong to profile; identified by `profile_id` foreign key
- **RLS Policy Example**: SELECT on goals only if `profile_id IN (user's profiles)`

```sql
-- Allows SELECT of goals if user owns the profile or is the parent
USING (
  profile_id IN (
    SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email'
    UNION
    SELECT id FROM profiles WHERE parent_id = 
      (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email')
  )
);
```

### Token Structure

**Supabase JWT** (prod):
```json
{
  "sub": "user-uuid",
  "email": "parent@example.com",
  "email_verified": true,
  "aud": "authenticated",
  "exp": 1704067200
}
```

**Development Mock Token** (dev only):
```json
{
  "id": "dev-{timestamp}",
  "email": "areenrahhal@gmail.com",
  "aud": "authenticated",
  "exp": {timestamp + 3600}
}
```

### Common Features & Benefits

| Feature | Benefit | Status |
|---------|---------|--------|
| Email verification | Confirms ownership before account use | ✓ Ready (Supabase built-in) |
| Password reset | Recovers locked accounts via email link | ✓ Ready |
| Session persistence | Survives page refresh | ✓ Ready |
| Automatic logout | Prevents unauthorized access on expiry | ✓ Ready (JWT expires) |
| Development fallback | Test without Supabase Auth setup | ✓ Active (dev-only) |
| Social auth (planned) | One-click signup via OAuth | ⏳ Future |

### Authentication Examples

**Sign In Flow**:
```typescript
// Frontend
const { success, user } = await authService.signIn('areenrahhal@gmail.com', 'password');
// Returns { success: true, user: User, session: Session }

// AuthContext listens for changes via onAuthStateChange()
// Updates user state → triggers ProfileProvider init
```

**Protected Route Example**:
```typescript
const Index = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingPage />;
  if (!user) return <LoginPage />;
  return <Dashboard />;
};
```

---

## 4) Security

### XSS & Rich-Text Handling

**Current State**:
- ✓ React auto-escapes JSX text content (prevents injection)
- ✓ No `dangerouslySetInnerHTML` used anywhere
- ✓ All user input validated with Zod schemas before storage
- ⚠ Rich-text editor not yet implemented; if added, must use `DOMPurify` or similar

**Best Practice** (if rich-text added):
```typescript
import DOMPurify from 'dompurify';
const safe = DOMPurify.sanitize(userInput);
```

### Content Security Policy (CSP)

**Current**: Not yet configured in Vite; recommended for production:
```
script-src 'self' https://cdn.supabase.co;
connect-src 'self' https://tbodhidiwwheifbbezye.supabase.co;
img-src 'self' data: https:;
```

### Upload Validation

**Current State**:
- Avatar uploads use URL validation (Zod `url()` check)
- File upload service not yet used in production
- If implemented, must validate:
  - MIME type (image only)
  - File size (< 5MB recommended)
  - Dimensions (max 4000x4000px)

**Example (future)**:
```typescript
const validateUpload = (file: File) => {
  if (!file.type.startsWith('image/')) throw new Error('Only images allowed');
  if (file.size > 5 * 1024 * 1024) throw new Error('Max 5MB');
};
```

### Secret Management

**Environment Variables** (frontend only - all public):
```
VITE_SUPABASE_URL=https://tbodhidiwwheifbbezye.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_rxjiBoq98BYWOHATWWeayQ_3rm9_i1A
```

**Why Safe**:
- Anon key is publicly known; RLS policies enforce access control
- Service role key never exposed (only backend has it)
- Private data protected by RLS, not key secrecy

**Secrets Never to Expose**:
- Supabase service role key (admin access)
- Database passwords
- Third-party API keys (stripe, etc.)

### Service Role Boundaries

| Operation | Client (Anon) | Server (Service Role) |
|-----------|---------------|-----------------------|
| Read own profile | ✓ (RLS check) | ✓ (bypass RLS) |
| Create child profile | ✓ (user is parent) | ✓ (unrestricted) |
| Delete any goal | ✗ (RLS denies) | ✓ (admin) |
| Create auth user | ✗ (auth client) | ✓ (admin) |

**Why Each Matters**:
- Anon key = user perspective; RLS protects data
- Service role = backend-only; never trust client with it
- Prevents privilege escalation and data leaks

---

## 5) Data Access Patterns

### Client → API Communication

```
User Action (React)
       ↓
useProfile() / useGoals() hooks
       ↓
ProfileContext / services (profileService, supabaseProfileService)
       ↓
Supabase Client (@supabase/supabase-js)
       ↓
HTTP/HTTPS + JWT auth header
       ↓
Supabase Edge (RLS policy check)
       ↓
PostgreSQL (row filtering)
       ↓
Response + error handling
       ↓
Cache in localStorage + update React state
```

**Example Query Path**:
```typescript
// 1. Hook called in component
const { currentProfile } = useProfile();

// 2. Backed by ProfileContext effect
useEffect(() => {
  const profiles = await supabaseProfileService.loadProfilesForParent(parentId);
  setProfiles(profiles);
}, [authenticatedUser]);

// 3. Service makes Supabase call
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('parent_id', parentId);

// 4. RLS enforces: user can only see own children
```

### Idempotent Writes

**Current Implementation**:
- Goal creation checks for duplicates before INSERT:
  ```typescript
  const { data: existingGoal } = await supabase
    .from('goals')
    .select('id')
    .eq('profile_id', profileId)
    .eq('goal_id', goalId)
    .single();
  if (existingGoal) return true; // Already exists = success
  ```
- Profile updates are full-row (no partial PATCH) to prevent conflicts
- No UUID v4 generation on client; server generates to ensure uniqueness

**Why Matters**: Retried requests don't create duplicates or corrupt state.

### Pagination

**Current**: Not implemented (app assumes < 100 profiles/goals).

**Future Implementation** (when needed):
```typescript
const { data, count } = await supabase
  .from('goals')
  .select('*', { count: 'exact' })
  .eq('profile_id', profileId)
  .range(0, 9); // First 10 records
```

### Error Handling

**Patterns**:

| Layer | Pattern | Example |
|-------|---------|---------|
| **Service** | Return result object | `{ success: boolean, error?: string, data?: T }` |
| **Context** | Log + state update | `console.error(); setError(msg)` |
| **Component** | Show toast or fallback UI | `toast.error('Failed to load goals')` |

**Example Flow**:
```typescript
// Service
async addGoalToProfile(profileId, goalId) {
  try {
    const { error } = await supabase.from('goals').insert({...});
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Context
const addGoal = useCallback(async (profileId, goalId) => {
  const result = await supabaseProfileService.addGoalToProfile(...);
  if (!result.success) {
    console.error('[addGoal] Error:', result.error);
    // Update state, don't throw
  }
}, []);

// Component
const onAddGoal = async () => {
  await addGoal(profileId, goalId);
  // Check profile state; if goal wasn't added, show fallback
};
```

**Timeout Protection**:
```typescript
// All Supabase queries have 10-second timeouts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);
try {
  const { data } = await supabase.from('profiles').select('*');
} finally {
  clearTimeout(timeoutId);
}
```

---

## 6) Logging & Monitoring

### Typical Failure Modes

| Mode | Root Cause | Where to Look | Solution |
|------|-----------|---------------|----------|
| **Auth fails (dev)** | Password mismatch | `authService.ts` DEV_TEST_PASSWORDS | Check console logs for expected vs. actual |
| **Auth fails (prod)** | User doesn't exist in Supabase Auth | Supabase Dashboard > Auth > Users | Create user in Supabase |
| **Profiles won't load** | Cached profile stale or RLS denies | `ProfileContext` effect logs | Check localStorage key; verify RLS policy |
| **Goals won't add** | Duplicate goal or parent not found | `supabaseProfileService.addGoalToProfile` logs | Check goal exists; verify parent_id |
| **Network timeout** | Slow network or Supabase down | Browser DevTools Network tab | Increase timeout; check Supabase status |
| **RLS policy error** | Email mismatch or malformed JWT | Supabase logs > Postgres; browser console | Verify auth.jwt() extraction in policy |

### Where to Look First

1. **Browser Console** (F12)
   - Look for `[AuthProvider]`, `[ProfileContext]`, `[profileService]` logs
   - Example: `[ProfileProvider] No authenticated user, skipping profile load`

2. **Supabase Logs** (Dashboard > Logs > Postgres)
   - Shows RLS policy denials
   - Example: `row security policy "users_can_read_own_profile" was violated`

3. **Network Tab** (DevTools)
   - Check HTTP status (401 = auth, 403 = RLS, 500 = server error)
   - Verify `Authorization: Bearer {token}` header present

4. **Application Tab** (DevTools)
   - localStorage keys: `currentParentId`, `parentProfile`, `loginEmail`
   - Verify cached profile matches loaded profile

### Logging Strategy

**Adopted Pattern**:
```
[ContextName] or [serviceName] {log message}
Example: [ProfileProvider] Initialized profiles for user: areenrahhal@gmail.com
```

**Levels**:
- `console.log()` - Info (loads, flow)
- `console.warn()` - Recoverable issues (cache stale, fallback used)
- `console.error()` - Unrecoverable issues (auth failed, profile missing)

**Development Mode Indicator**:
```typescript
if (import.meta.env.DEV) {
  console.info('[AuthProvider] 🔧 DEVELOPMENT MODE: Using mock authentication...');
}
```

---

## 7) Benefits & Rationale

### Performance

| Choice | Benefit | Trade-off |
|--------|---------|-----------|
| Cache-first profile loading | Instant UI on page refresh | Background sync adds complexity |
| Parallel goal loading (Promise.all) | Faster profile hydration | If one goal fails, retry entire batch |
| localStorage caching | No flash of empty state | Manual cache invalidation needed |
| Vite + SWC | < 1s HMR rebuild | Requires manual page refresh on RLS changes |

### Security

| Choice | Benefit | Why |
|--------|---------|-----|
| RLS at DB layer | Unauthorized queries rejected server-side | Frontend security is advisory only |
| Anon key for client | Limited damage if exposed | Service role never sent to browser |
| Email + password (no SMS) | Simpler implementation | Can add TOTP later if needed |
| JWT validation server-side | Prevents token forgery | Client JWT is untrusted |

### Developer Experience

| Choice | Benefit | Context |
|--------|---------|---------|
| Development auth fallback | Test without Supabase setup | Only active in `import.meta.env.DEV` |
| Comprehensive logging | Easy debugging | All major operations logged with prefixes |
| Zod validation | Catch bad data before DB | Better error messages than SQL constraints |
| React Context pattern | No Redux boilerplate | Sufficient for current app scope |

---

## 8) Common Mistakes & Do's/Don'ts

### Documented Past Issues

| Issue | Root Cause | Do | Don't |
|-------|-----------|----|----|
| **Chrome crash on Add Goal** | GoalsModalMenu had double fixed positioning (z-stacking bug) | Structure fixed overlays carefully | Don't nest fixed positioning |
| **Profile not found after signup** | New parent profile not saved to database | Always await `supabaseProfileService.saveProfile()` | Don't assume client-side data persists |
| **Stale profile data** | Cached data never refreshed | Call `loadProfilesWithGoals()` after mutations | Don't rely on localStorage alone |
| **Auth user missing on Supabase** | Created profile but not auth user | Create auth user first, then profile | Don't assume Supabase Auth auto-creates users |

### Do's

✓ **Do validate all input** with Zod before mutation
```typescript
const validated = ProfileUpdateSchema.parse(updates);
await supabaseProfileService.updateProfile(profileId, validated);
```

✓ **Do use RLS policies** to enforce access control
```sql
CREATE POLICY "users_can_read_own_goals"
ON public.goals
FOR SELECT
TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE email = auth.jwt() ->> 'email'));
```

✓ **Do handle errors gracefully**
```typescript
const result = await addGoal(...);
if (!result.success) {
  console.error('Failed:', result.error);
  toast.error('Could not add goal');
}
```

✓ **Do cache aggressively** (localStorage + Context state)

✓ **Do log at operation boundaries** (service calls, effects)

### Don'ts

✗ **Don't expose service role key** to frontend
✗ **Don't use dangerouslySetInnerHTML** without sanitization
✗ **Don't assume RLS prevents all bugs** (still validate on client)
✗ **Don't store passwords** in localStorage or logs
✗ **Don't add child profiles without parent validation**
✗ **Don't forget email indexes** on RLS policy tables (performance killer)
✗ **Don't mix dev/prod auth** (dev fallback is dev-only)

---

## 9) Future Improvements

| Item | Why | Effort | Priority |
|------|-----|--------|----------|
| **Real-time goals sync** | Multiplayer families need live updates | Medium | High |
| **Social auth (Google/Apple)** | Reduce signup friction | Medium | High |
| **Offline support** (Service Worker) | Works in areas with spotty connectivity | High | Medium |
| **Advanced analytics** | Track learning trends (spaced repetition effectiveness) | Medium | Low |
| **Video lessons** | Engagement & retention improvement | High | Low |
| **AI tutor (LLM)** | Personalized guidance on Tajweed | High | Medium |
| **Email notifications** | Reminders for daily practice | Low | Medium |
| **Mobile app** (React Native) | Reach more users | Very High | Low |
| **Achievement sharing** | Gamification virality | Low | Low |

**Quick Wins** (< 1 day):
- Implement email verification in onboarding
- Add "Last updated" timestamps to profiles
- Create Sentry/Datadog integration for error monitoring

---

## Appendix: Deployment Checklist

- [ ] Enable RLS on all tables
- [ ] Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- [ ] Create Supabase Auth users (remove development fallback from prod builds)
- [ ] Create database indexes on `email`, `parent_id`, `profile_id`
- [ ] Test RLS policies with multiple users
- [ ] Configure CORS on Supabase
- [ ] Enable email verification in Auth settings
- [ ] Set up password reset email template
- [ ] Configure CSP headers on host
- [ ] Remove console.log statements from production build
- [ ] Test with real authentication (not dev fallback)
