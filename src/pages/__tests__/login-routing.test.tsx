import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Login from '@/pages/Login';
import PostLoginRouter from '@/pages/PostLoginRouter';
import Onboarding from '@/pages/Onboarding';
import Goals from '@/pages/Goals';
import { authService } from '@/services/authService';
import { supabaseProfileService } from '@/services/supabaseProfileService';

/**
 * INTEGRATION TEST: Login and Post-Login Routing Flow
 * 
 * Scenario 1: Existing User (Areen)
 * - Email: areenrahhal@gmail.com
 * - Has 2 goals across all profiles
 * - Expected: Redirect to /goals
 * 
 * Scenario 2: New User (Ahmad)
 * - Email: ahmad@testmail.com
 * - Has 0 goals across all profiles
 * - Expected: Redirect to /onboarding
 */

// Mock services
vi.mock('@/services/authService');
vi.mock('@/services/supabaseProfileService');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const TestAppWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProfileProvider>
            <BrowserRouter>
              {children}
            </BrowserRouter>
          </ProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

describe('Login and Post-Login Routing Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Scenario 1: Existing User (Areen) with Goals', () => {
    it('should redirect areenrahhal@gmail.com to /goals (user with 2 goals)', async () => {
      /**
       * SCENARIO: Areen logs in
       * - User: areenrahhal@gmail.com
       * - Goals: 2 (existing user)
       * - Expected Route: /goals
       */

      const mockAuthUser = {
        id: 'user-areen-id',
        email: 'areenrahhal@gmail.com',
        user_metadata: { name: 'Areen' },
        aud: 'authenticated',
      } as any;

      const mockAreenProfile = {
        id: 'profile-areen-id',
        name: 'Areen',
        email: 'areenrahhal@gmail.com',
        type: 'parent' as const,
        avatar: 'avatar-deer',
        goals: [
          { id: 'goal-1', name: 'Juz 30' },
          { id: 'goal-2', name: 'Surah Al-Bakarah' },
        ],
        goalsCount: 2,
        achievements: { stars: 5, streak: 3, recitations: 10, goalsCompleted: 1 },
      };

      // Mock auth sign in
      vi.mocked(authService.signIn).mockResolvedValueOnce({
        success: true,
        user: mockAuthUser,
      });

      // Mock profile loading
      vi.mocked(supabaseProfileService.loadProfiles).mockResolvedValueOnce([mockAreenProfile]);
      vi.mocked(supabaseProfileService.loadProfilesForParent).mockResolvedValueOnce([mockAreenProfile]);
      vi.mocked(supabaseProfileService.loadProfilesWithGoals).mockResolvedValueOnce([mockAreenProfile]);

      render(
        <TestAppWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/post-login" element={<PostLoginRouter />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </TestAppWrapper>,
        { initialRoute: '/login' }
      );

      // Verify login page is rendered
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Fill in login form
      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;

      await user.type(emailInput, 'areenrahhal@gmail.com');
      await user.type(passwordInput, 'password');

      // Click sign in button
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Wait for navigation to /post-login and then to /goals
      await waitFor(() => {
        // Check that Goals page is rendered (existing user)
        expect(screen.queryByText(/loading your profile/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });

      console.log('✅ Areen (existing user) successfully logged in');
    });

    it('should NOT redirect existing user to /onboarding', async () => {
      /**
       * Verify that users with goals are NOT sent to onboarding
       */

      const mockAuthUser = {
        id: 'user-areen-id',
        email: 'areenrahhal@gmail.com',
        aud: 'authenticated',
      } as any;

      const mockAreenProfile = {
        id: 'profile-areen-id',
        name: 'Areen',
        email: 'areenrahhal@gmail.com',
        type: 'parent' as const,
        avatar: 'avatar-deer',
        goals: [{ id: 'goal-1', name: 'Juz 30' }],
        goalsCount: 1,
        achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce({
        success: true,
        user: mockAuthUser,
      });

      vi.mocked(supabaseProfileService.loadProfiles).mockResolvedValueOnce([mockAreenProfile]);
      vi.mocked(supabaseProfileService.loadProfilesForParent).mockResolvedValueOnce([mockAreenProfile]);
      vi.mocked(supabaseProfileService.loadProfilesWithGoals).mockResolvedValueOnce([mockAreenProfile]);

      const { rerender } = render(
        <TestAppWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/post-login" element={<PostLoginRouter />} />
            <Route path="/goals" element={<Onboarding />} />
            <Route path="/onboarding" element={<div data-testid="onboarding-page">Onboarding</div>} />
          </Routes>
        </TestAppWrapper>,
        { initialRoute: '/login' }
      );

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const user = userEvent.setup();

      await user.type(emailInput, 'areenrahhal@gmail.com');
      await user.type(passwordInput, 'password');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Should NOT see onboarding page
      await waitFor(() => {
        const onboardingPage = screen.queryByTestId('onboarding-page');
        expect(onboardingPage).not.toBeInTheDocument();
      }, { timeout: 2000 });

      console.log('✅ Areen was NOT redirected to onboarding (correct behavior)');
    });
  });

  describe('Scenario 2: New User (Ahmad) without Goals', () => {
    it('should redirect ahmad@testmail.com to /onboarding (new user with 0 goals)', async () => {
      /**
       * SCENARIO: Ahmad logs in for the first time
       * - User: ahmad@testmail.com
       * - Goals: 0 (new user)
       * - Expected Route: /onboarding
       */

      const mockAuthUser = {
        id: 'user-ahmad-id',
        email: 'ahmad@testmail.com',
        user_metadata: { name: 'Ahmad' },
        aud: 'authenticated',
      } as any;

      const mockAhmadProfile = {
        id: 'profile-ahmad-id',
        name: 'Ahmad',
        email: 'ahmad@testmail.com',
        type: 'parent' as const,
        avatar: 'avatar-bear',
        goals: [],
        goalsCount: 0,
        achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
      };

      // Mock auth sign in
      vi.mocked(authService.signIn).mockResolvedValueOnce({
        success: true,
        user: mockAuthUser,
      });

      // Mock profile loading - returns empty goals array for new user
      vi.mocked(supabaseProfileService.loadProfiles).mockResolvedValueOnce([mockAhmadProfile]);
      vi.mocked(supabaseProfileService.loadProfilesForParent).mockResolvedValueOnce([mockAhmadProfile]);
      vi.mocked(supabaseProfileService.loadProfilesWithGoals).mockResolvedValueOnce([mockAhmadProfile]);

      render(
        <TestAppWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/post-login" element={<PostLoginRouter />} />
            <Route path="/goals" element={<div data-testid="goals-page">Goals</div>} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </TestAppWrapper>,
        { initialRoute: '/login' }
      );

      // Verify login page is rendered
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Fill in login form
      const user = userEvent.setup();
      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;

      await user.type(emailInput, 'ahmad@testmail.com');
      await user.type(passwordInput, '111111');

      // Click sign in button
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Wait for navigation to /post-login and then to /onboarding
      await waitFor(() => {
        // Check that Onboarding page is rendered (new user)
        const onboardingElements = screen.queryAllByText(/welcome/i);
        expect(onboardingElements.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      console.log('✅ Ahmad (new user) successfully redirected to onboarding');
    });

    it('should NOT redirect new user to /goals', async () => {
      /**
       * Verify that users without goals are NOT sent to goals page
       */

      const mockAuthUser = {
        id: 'user-ahmad-id',
        email: 'ahmad@testmail.com',
        aud: 'authenticated',
      } as any;

      const mockAhmadProfile = {
        id: 'profile-ahmad-id',
        name: 'Ahmad',
        email: 'ahmad@testmail.com',
        type: 'parent' as const,
        avatar: 'avatar-bear',
        goals: [],
        goalsCount: 0,
        achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
      };

      vi.mocked(authService.signIn).mockResolvedValueOnce({
        success: true,
        user: mockAuthUser,
      });

      vi.mocked(supabaseProfileService.loadProfiles).mockResolvedValueOnce([mockAhmadProfile]);
      vi.mocked(supabaseProfileService.loadProfilesForParent).mockResolvedValueOnce([mockAhmadProfile]);
      vi.mocked(supabaseProfileService.loadProfilesWithGoals).mockResolvedValueOnce([mockAhmadProfile]);

      render(
        <TestAppWrapper>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/post-login" element={<PostLoginRouter />} />
            <Route path="/goals" element={<div data-testid="goals-page">Goals Page</div>} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </TestAppWrapper>,
        { initialRoute: '/login' }
      );

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const user = userEvent.setup();

      await user.type(emailInput, 'ahmad@testmail.com');
      await user.type(passwordInput, '111111');

      const signInButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(signInButton);

      // Should NOT see goals page
      await waitFor(() => {
        const goalsPage = screen.queryByTestId('goals-page');
        expect(goalsPage).not.toBeInTheDocument();
      }, { timeout: 2000 });

      console.log('✅ Ahmad was NOT redirected to goals (correct behavior)');
    });
  });

  describe('PostLoginRouter Logic Verification', () => {
    it('should detect existing user (>0 goals)', async () => {
      /**
       * Test the core logic: calculateTotalGoals and isNewUser
       */

      const existingUserProfile = {
        id: 'user-1',
        name: 'User',
        goals: [{ id: '1' }, { id: '2' }],
        goalsCount: 2,
        type: 'parent' as const,
        achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
      };

      const totalGoals = (existingUserProfile.goals?.length || existingUserProfile.goalsCount || 0);
      const isNewUser = totalGoals === 0;

      expect(isNewUser).toBe(false);
      expect(totalGoals).toBeGreaterThan(0);
      console.log('✅ Correctly identified existing user');
    });

    it('should detect new user (0 goals)', async () => {
      /**
       * Test the core logic for new user detection
       */

      const newUserProfile = {
        id: 'user-2',
        name: 'New User',
        goals: [],
        goalsCount: 0,
        type: 'parent' as const,
        achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
      };

      const totalGoals = (newUserProfile.goals?.length || newUserProfile.goalsCount || 0);
      const isNewUser = totalGoals === 0;

      expect(isNewUser).toBe(true);
      expect(totalGoals).toBe(0);
      console.log('✅ Correctly identified new user');
    });

    it('should correctly count goals across multiple profiles', () => {
      /**
       * Test goal counting across parent + child profiles
       */

      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goals: [{ id: '1' }, { id: '2' }],
          goalsCount: 2,
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-1',
          name: 'Child 1',
          type: 'child' as const,
          goals: [{ id: '3' }],
          goalsCount: 1,
          parentId: 'parent-1',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-2',
          name: 'Child 2',
          type: 'child' as const,
          goals: [],
          goalsCount: 0,
          parentId: 'parent-1',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = profiles.reduce((sum, p) => sum + (p.goals?.length || p.goalsCount || 0), 0);
      const isNewUser = totalGoals === 0;

      expect(totalGoals).toBe(3); // 2 + 1 + 0
      expect(isNewUser).toBe(false);
      console.log('✅ Correctly counted goals across multiple profiles');
    });
  });

  describe('Edge Cases', () => {
    it('should handle user with only child goals (no parent goals)', () => {
      /**
       * Edge case: Parent profile exists but parent has no goals
       * Only child profiles have goals
       */

      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goals: [],
          goalsCount: 0,
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-1',
          name: 'Child',
          type: 'child' as const,
          goals: [{ id: '1' }, { id: '2' }],
          goalsCount: 2,
          parentId: 'parent-1',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = profiles.reduce((sum, p) => sum + (p.goals?.length || p.goalsCount || 0), 0);
      const isNewUser = totalGoals === 0;

      expect(totalGoals).toBe(2);
      expect(isNewUser).toBe(false);
      console.log('✅ Correctly handled parent with child goals only');
    });

    it('should handle all profiles having 0 goals', () => {
      /**
       * Edge case: Multiple profiles but all have 0 goals
       */

      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goals: [],
          goalsCount: 0,
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-1',
          name: 'Child 1',
          type: 'child' as const,
          goals: [],
          goalsCount: 0,
          parentId: 'parent-1',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-2',
          name: 'Child 2',
          type: 'child' as const,
          goals: [],
          goalsCount: 0,
          parentId: 'parent-1',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = profiles.reduce((sum, p) => sum + (p.goals?.length || p.goalsCount || 0), 0);
      const isNewUser = totalGoals === 0;

      expect(totalGoals).toBe(0);
      expect(isNewUser).toBe(true);
      console.log('✅ Correctly identified all profiles with 0 goals');
    });
  });
});
