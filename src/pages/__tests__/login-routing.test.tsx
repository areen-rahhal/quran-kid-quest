import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isNewUser, calculateTotalGoals } from '@/lib/utils';

/**
 * UNIT TEST: Login and Post-Login Routing Flow
 * 
 * Test scenarios:
 * 1. Existing User (Areen): areenrahhal@gmail.com with 2 goals → redirect to /goals
 * 2. New User (Ahmad): ahmad@testmail.com with 0 goals → redirect to /onboarding
 * 
 * The routing logic is based on total goal count:
 * - 0 goals total = new user → /onboarding
 * - >0 goals total = existing user → /goals
 */

describe('Post-Login Routing Logic', () => {
  describe('Core Utility Functions', () => {
    describe('calculateTotalGoals()', () => {
      it('should calculate total goals from all profiles (parent + children)', () => {
        const profiles = [
          {
            id: 'parent-1',
            name: 'Areen',
            type: 'parent' as const,
            goals: [
              { id: 'goal-1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 },
              { id: 'goal-2', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
            ],
            goalsCount: 2,
            avatar: 'avatar-deer',
            achievements: { stars: 5, streak: 3, recitations: 10, goalsCompleted: 1 },
          },
        ];

        const totalGoals = calculateTotalGoals(profiles);
        expect(totalGoals).toBe(2);
      });

      it('should count goals across multiple profiles (parent + children)', () => {
        const profiles = [
          {
            id: 'parent-1',
            name: 'Parent',
            type: 'parent' as const,
            goals: [{ id: '1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 }],
            goalsCount: 1,
            avatar: 'avatar-deer',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
          {
            id: 'child-1',
            name: 'Child 1',
            type: 'child' as const,
            goals: [
              { id: '2', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
              { id: '3', goalId: 'juz-29', name: 'Juz 29', phaseSize: 1 },
            ],
            goalsCount: 2,
            parentId: 'parent-1',
            avatar: 'avatar-bear',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
          {
            id: 'child-2',
            name: 'Child 2',
            type: 'child' as const,
            goals: [],
            goalsCount: 0,
            parentId: 'parent-1',
            avatar: 'avatar-lion',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
        ];

        const totalGoals = calculateTotalGoals(profiles);
        expect(totalGoals).toBe(3); // 1 + 2 + 0
      });

      it('should return 0 when all profiles have no goals', () => {
        const profiles = [
          {
            id: 'parent-1',
            name: 'New Parent',
            type: 'parent' as const,
            goals: [],
            goalsCount: 0,
            avatar: 'avatar-deer',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
        ];

        const totalGoals = calculateTotalGoals(profiles);
        expect(totalGoals).toBe(0);
      });

      it('should handle profiles with undefined or null goals', () => {
        const profiles = [
          {
            id: 'parent-1',
            name: 'Parent',
            type: 'parent' as const,
            goals: undefined,
            goalsCount: 0,
            avatar: 'avatar-deer',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
        ] as any;

        const totalGoals = calculateTotalGoals(profiles);
        expect(totalGoals).toBe(0);
      });
    });

    describe('isNewUser()', () => {
      it('should return true for users with 0 goals (new user)', () => {
        const newUserProfile = [
          {
            id: 'ahmad-profile-id',
            name: 'Ahmad',
            type: 'parent' as const,
            goals: [],
            goalsCount: 0,
            avatar: 'avatar-bear',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
        ];

        expect(isNewUser(newUserProfile)).toBe(true);
      });

      it('should return false for users with >0 goals (existing user)', () => {
        const existingUserProfile = [
          {
            id: 'areen-profile-id',
            name: 'Areen',
            type: 'parent' as const,
            goals: [
              { id: '1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 },
              { id: '2', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
            ],
            goalsCount: 2,
            avatar: 'avatar-deer',
            achievements: { stars: 5, streak: 3, recitations: 10, goalsCompleted: 1 },
          },
        ];

        expect(isNewUser(existingUserProfile)).toBe(false);
      });

      it('should return false when any profile has goals', () => {
        const mixedProfiles = [
          {
            id: 'parent-1',
            name: 'Parent',
            type: 'parent' as const,
            goals: [],
            goalsCount: 0,
            avatar: 'avatar-deer',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
          {
            id: 'child-1',
            name: 'Child',
            type: 'child' as const,
            goals: [{ id: '1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 }],
            goalsCount: 1,
            parentId: 'parent-1',
            avatar: 'avatar-bear',
            achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
          },
        ];

        // Even though parent has 0 goals, child has 1, so total is 1, not a new user
        expect(isNewUser(mixedProfiles)).toBe(false);
      });
    });
  });

  describe('Scenario 1: Existing User (Areen) with Goals', () => {
    it('should identify areenrahhal@gmail.com as existing user (has 2 goals)', () => {
      /**
       * SCENARIO: Areen (areenrahhal@gmail.com)
       * - Has 2 goals
       * - Should route to /goals
       * - isNewUser should return false
       */
      const areenProfiles = [
        {
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areenrahhal@gmail.com',
          type: 'parent' as const,
          avatar: 'avatar-deer',
          goals: [
            { id: 'goal-1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 },
            { id: 'goal-2', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
          ],
          goalsCount: 2,
          achievements: { stars: 5, streak: 3, recitations: 10, goalsCompleted: 1 },
        },
      ];

      const totalGoals = calculateTotalGoals(areenProfiles);
      const isNew = isNewUser(areenProfiles);

      expect(totalGoals).toBe(2);
      expect(isNew).toBe(false);
      console.log('✅ SCENARIO 1: Areen identified as existing user (not new)');
      console.log(`   - Profile: ${areenProfiles[0].name} (${areenProfiles[0].email})`);
      console.log(`   - Goals: ${totalGoals}`);
      console.log(`   - Route: /goals (because isNewUser=${isNew})`);
    });

    it('should route existing user to /goals page (not /onboarding)', () => {
      const areenProfiles = [
        {
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areenrahhal@gmail.com',
          type: 'parent' as const,
          avatar: 'avatar-deer',
          goals: [
            { id: 'goal-1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 },
            { id: 'goal-2', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
          ],
          goalsCount: 2,
          achievements: { stars: 5, streak: 3, recitations: 10, goalsCompleted: 1 },
        },
      ];

      const shouldRouteToGoals = !isNewUser(areenProfiles);
      const shouldRouteToOnboarding = isNewUser(areenProfiles);

      expect(shouldRouteToGoals).toBe(true);
      expect(shouldRouteToOnboarding).toBe(false);
      console.log('✅ EXPECTED BEHAVIOR: Areen should route to /goals, NOT /onboarding');
    });
  });

  describe('Scenario 2: New User (Ahmad) without Goals', () => {
    it('should identify ahmad@testmail.com as new user (has 0 goals)', () => {
      /**
       * SCENARIO: Ahmad (ahmad@testmail.com)
       * - Has 0 goals
       * - Should route to /onboarding
       * - isNewUser should return true
       */
      const ahmadProfiles = [
        {
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad@testmail.com',
          type: 'parent' as const,
          avatar: 'avatar-bear',
          goals: [],
          goalsCount: 0,
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = calculateTotalGoals(ahmadProfiles);
      const isNew = isNewUser(ahmadProfiles);

      expect(totalGoals).toBe(0);
      expect(isNew).toBe(true);
      console.log('✅ SCENARIO 2: Ahmad identified as new user');
      console.log(`   - Profile: ${ahmadProfiles[0].name} (${ahmadProfiles[0].email})`);
      console.log(`   - Goals: ${totalGoals}`);
      console.log(`   - Route: /onboarding (because isNewUser=${isNew})`);
    });

    it('should route new user to /onboarding page (not /goals)', () => {
      const ahmadProfiles = [
        {
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad@testmail.com',
          type: 'parent' as const,
          avatar: 'avatar-bear',
          goals: [],
          goalsCount: 0,
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const shouldRouteToOnboarding = isNewUser(ahmadProfiles);
      const shouldRouteToGoals = !isNewUser(ahmadProfiles);

      expect(shouldRouteToOnboarding).toBe(true);
      expect(shouldRouteToGoals).toBe(false);
      console.log('✅ EXPECTED BEHAVIOR: Ahmad should route to /onboarding, NOT /goals');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle user with only child goals (parent has 0, children have goals)', () => {
      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goals: [],
          goalsCount: 0,
          avatar: 'avatar-deer',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-1',
          name: 'Child',
          type: 'child' as const,
          goals: [
            { id: '1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 },
            { id: '2', goalId: 'juz-29', name: 'Juz 29', phaseSize: 1 },
          ],
          goalsCount: 2,
          parentId: 'parent-1',
          avatar: 'avatar-bear',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = calculateTotalGoals(profiles);
      const isNew = isNewUser(profiles);

      expect(totalGoals).toBe(2);
      expect(isNew).toBe(false);
      console.log('✅ Edge case: Parent with 0 goals + Child with goals = existing user');
    });

    it('should handle multiple children with different goal counts', () => {
      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goals: [{ id: '1', goalId: 'juz-30', name: 'Juz 30', phaseSize: 1 }],
          goalsCount: 1,
          avatar: 'avatar-deer',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-1',
          name: 'Child 1',
          type: 'child' as const,
          goals: [
            { id: '2', goalId: 'juz-29', name: 'Juz 29', phaseSize: 1 },
            { id: '3', goalId: 'surah-bakarah', name: 'Surah Al-Bakarah', phaseSize: 1 },
          ],
          goalsCount: 2,
          parentId: 'parent-1',
          avatar: 'avatar-bear',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-2',
          name: 'Child 2',
          type: 'child' as const,
          goals: [],
          goalsCount: 0,
          parentId: 'parent-1',
          avatar: 'avatar-lion',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
        {
          id: 'child-3',
          name: 'Child 3',
          type: 'child' as const,
          goals: [{ id: '4', goalId: 'juz-1', name: 'Juz 1', phaseSize: 1 }],
          goalsCount: 1,
          parentId: 'parent-1',
          avatar: 'avatar-tiger',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = calculateTotalGoals(profiles);
      const isNew = isNewUser(profiles);

      expect(totalGoals).toBe(4); // 1 + 2 + 0 + 1
      expect(isNew).toBe(false);
      console.log('✅ Edge case: Multiple children with varying goal counts counted correctly');
    });

    it('should handle empty profile array', () => {
      const profiles: any[] = [];

      const totalGoals = calculateTotalGoals(profiles);
      const isNew = isNewUser(profiles);

      expect(totalGoals).toBe(0);
      expect(isNew).toBe(true);
      console.log('✅ Edge case: Empty profile array identified as new user');
    });

    it('should handle profiles with goalsCount property instead of goals array', () => {
      const profiles = [
        {
          id: 'parent-1',
          name: 'Parent',
          type: 'parent' as const,
          goalsCount: 3, // Uses goalsCount instead of goals array
          avatar: 'avatar-deer',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        } as any,
      ];

      const totalGoals = calculateTotalGoals(profiles);
      const isNew = isNewUser(profiles);

      expect(totalGoals).toBe(3);
      expect(isNew).toBe(false);
      console.log('✅ Edge case: Using goalsCount property handled correctly');
    });
  });

  describe('Real-World Supabase Data Verification', () => {
    it('should correctly process Areen data from Supabase', () => {
      /**
       * Real data from Supabase query:
       * {
       *   "id": "de618e2e-092e-489e-899d-845824ebc358",
       *   "name": "Areen",
       *   "email": "areenrahhal@gmail.com",
       *   "type": "parent",
       *   "goal_count": 2
       * }
       */
      const supabaseAreenData = [
        {
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areenrahhal@gmail.com',
          type: 'parent' as const,
          goalsCount: 2,
          goals: [],
          avatar: 'avatar-deer',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = calculateTotalGoals(supabaseAreenData);
      const isNew = isNewUser(supabaseAreenData);
      const shouldRouteToGoals = !isNew;

      expect(totalGoals).toBe(2);
      expect(isNew).toBe(false);
      expect(shouldRouteToGoals).toBe(true);
      console.log('✅ Real Supabase data: Areen correctly routed to /goals');
    });

    it('should correctly process Ahmad data from Supabase', () => {
      /**
       * Real data from Supabase insertion:
       * {
       *   "id": "ff5b5b17-3c26-4111-9a29-46c0dd0ee419",
       *   "name": "Ahmad",
       *   "email": "ahmad@testmail.com",
       *   "type": "parent",
       *   "goals_count": 0
       * }
       */
      const supabaseAhmadData = [
        {
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad@testmail.com',
          type: 'parent' as const,
          goalsCount: 0,
          goals: [],
          avatar: 'avatar-bear',
          achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
        },
      ];

      const totalGoals = calculateTotalGoals(supabaseAhmadData);
      const isNew = isNewUser(supabaseAhmadData);
      const shouldRouteToOnboarding = isNew;

      expect(totalGoals).toBe(0);
      expect(isNew).toBe(true);
      expect(shouldRouteToOnboarding).toBe(true);
      console.log('✅ Real Supabase data: Ahmad correctly routed to /onboarding');
    });
  });
});
