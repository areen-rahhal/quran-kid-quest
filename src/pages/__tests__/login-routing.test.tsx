import { describe, it, expect } from 'vitest';
import { isNewUser, calculateTotalGoals } from '@/lib/utils';
import type { Profile } from '@/types/profile';
import type { GoalProgress } from '@/types/goals';

/**
 * UNIT TEST: Login and Post-Login Routing Flow
 * 
 * Test scenarios:
 * 1. Existing User (Areen): areen.dev@example.test with 2 goals → redirect to /goals
 * 2. New User (Ahmad): ahmad.dev@example.test with 0 goals → redirect to /onboarding
 */

const createGoal = (overrides: Partial<GoalProgress> = {}): GoalProgress => ({
  id: 'goal-1',
  name: 'Test Goal',
  status: 'in-progress',
  phaseSize: 1,
  ...overrides,
});

const createProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'test-id',
  name: 'Test',
  type: 'parent',
  goalsCount: 0,
  avatar: 'avatar-deer',
  achievements: { stars: 0, streak: 0, recitations: 0, goalsCompleted: 0 },
  goals: [],
  ...overrides,
});

describe('Post-Login Routing Logic', () => {
  describe('Core Utility Functions', () => {
    describe('calculateTotalGoals()', () => {
      it('should calculate total goals from all profiles', () => {
        const profiles: Profile[] = [
          createProfile({
            id: 'parent-1',
            name: 'Areen',
            goals: [
              createGoal({ id: 'goal-1', name: 'Juz 30' }),
              createGoal({ id: 'goal-2', name: 'Surah Al-Bakarah' }),
            ],
            goalsCount: 2,
          }),
        ];

        expect(calculateTotalGoals(profiles)).toBe(2);
      });

      it('should count goals across multiple profiles', () => {
        const profiles: Profile[] = [
          createProfile({
            id: 'parent-1',
            name: 'Parent',
            goals: [createGoal({ id: '1', name: 'Juz 30' })],
            goalsCount: 1,
          }),
          createProfile({
            id: 'child-1',
            name: 'Child 1',
            type: 'child',
            parentId: 'parent-1',
            goals: [
              createGoal({ id: '2', name: 'Surah Al-Bakarah' }),
              createGoal({ id: '3', name: 'Juz 29' }),
            ],
            goalsCount: 2,
            avatar: 'avatar-bear',
          }),
          createProfile({
            id: 'child-2',
            name: 'Child 2',
            type: 'child',
            parentId: 'parent-1',
            goals: [],
            goalsCount: 0,
            avatar: 'avatar-lion',
          }),
        ];

        expect(calculateTotalGoals(profiles)).toBe(3);
      });

      it('should return 0 when all profiles have no goals', () => {
        const profiles: Profile[] = [
          createProfile({ id: 'parent-1', name: 'New Parent', goals: [], goalsCount: 0 }),
        ];

        expect(calculateTotalGoals(profiles)).toBe(0);
      });

      it('should handle profiles with undefined goals', () => {
        const profiles = [
          createProfile({ id: 'parent-1', name: 'Parent', goals: undefined, goalsCount: 0 }),
        ] as Profile[];

        expect(calculateTotalGoals(profiles)).toBe(0);
      });
    });

    describe('isNewUser()', () => {
      it('should return true for users with 0 goals (new user)', () => {
        const profiles: Profile[] = [
          createProfile({ id: 'ahmad-id', name: 'Ahmad', goals: [], goalsCount: 0, avatar: 'avatar-bear' }),
        ];

        expect(isNewUser(profiles)).toBe(true);
      });

      it('should return false for users with >0 goals (existing user)', () => {
        const profiles: Profile[] = [
          createProfile({
            id: 'areen-id',
            name: 'Areen',
            goals: [
              createGoal({ id: '1', name: 'Juz 30' }),
              createGoal({ id: '2', name: 'Surah Al-Bakarah' }),
            ],
            goalsCount: 2,
          }),
        ];

        expect(isNewUser(profiles)).toBe(false);
      });

      it('should return false when any profile has goals', () => {
        const profiles: Profile[] = [
          createProfile({ id: 'parent-1', name: 'Parent', goals: [], goalsCount: 0 }),
          createProfile({
            id: 'child-1',
            name: 'Child',
            type: 'child',
            parentId: 'parent-1',
            goals: [createGoal({ id: '1', name: 'Juz 30' })],
            goalsCount: 1,
            avatar: 'avatar-bear',
          }),
        ];

        expect(isNewUser(profiles)).toBe(false);
      });
    });
  });

  describe('Scenario 1: Existing User with Goals', () => {
    it('should identify user with goals as existing user', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areen.dev@example.test',
          goals: [
            createGoal({ id: 'goal-1', name: 'Juz 30' }),
            createGoal({ id: 'goal-2', name: 'Surah Al-Bakarah' }),
          ],
          goalsCount: 2,
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(2);
      expect(isNewUser(profiles)).toBe(false);
    });

    it('should route existing user to /goals page', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areen.dev@example.test',
          goals: [
            createGoal({ id: 'goal-1', name: 'Juz 30' }),
            createGoal({ id: 'goal-2', name: 'Surah Al-Bakarah' }),
          ],
          goalsCount: 2,
        }),
      ];

      const shouldRouteToGoals = !isNewUser(profiles);
      expect(shouldRouteToGoals).toBe(true);
    });
  });

  describe('Scenario 2: New User without Goals', () => {
    it('should identify user with 0 goals as new user', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad.dev@example.test',
          goals: [],
          goalsCount: 0,
          avatar: 'avatar-bear',
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(0);
      expect(isNewUser(profiles)).toBe(true);
    });

    it('should route new user to /onboarding page', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad.dev@example.test',
          goals: [],
          goalsCount: 0,
          avatar: 'avatar-bear',
        }),
      ];

      const shouldRouteToOnboarding = isNewUser(profiles);
      expect(shouldRouteToOnboarding).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle parent with 0 goals but child with goals', () => {
      const profiles: Profile[] = [
        createProfile({ id: 'parent-1', name: 'Parent', goals: [], goalsCount: 0 }),
        createProfile({
          id: 'child-1',
          name: 'Child',
          type: 'child',
          parentId: 'parent-1',
          goals: [
            createGoal({ id: '1', name: 'Juz 30' }),
            createGoal({ id: '2', name: 'Juz 29' }),
          ],
          goalsCount: 2,
          avatar: 'avatar-bear',
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(2);
      expect(isNewUser(profiles)).toBe(false);
    });

    it('should handle multiple children with different goal counts', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'parent-1',
          name: 'Parent',
          goals: [createGoal({ id: '1', name: 'Juz 30' })],
          goalsCount: 1,
        }),
        createProfile({
          id: 'child-1',
          name: 'Child 1',
          type: 'child',
          parentId: 'parent-1',
          goals: [
            createGoal({ id: '2', name: 'Juz 29' }),
            createGoal({ id: '3', name: 'Surah Al-Bakarah' }),
          ],
          goalsCount: 2,
          avatar: 'avatar-bear',
        }),
        createProfile({
          id: 'child-2',
          name: 'Child 2',
          type: 'child',
          parentId: 'parent-1',
          goals: [],
          goalsCount: 0,
          avatar: 'avatar-lion',
        }),
        createProfile({
          id: 'child-3',
          name: 'Child 3',
          type: 'child',
          parentId: 'parent-1',
          goals: [createGoal({ id: '4', name: 'Juz 1' })],
          goalsCount: 1,
          avatar: 'avatar-tiger',
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(4);
      expect(isNewUser(profiles)).toBe(false);
    });

    it('should handle empty profile array', () => {
      const profiles: Profile[] = [];

      expect(calculateTotalGoals(profiles)).toBe(0);
      expect(isNewUser(profiles)).toBe(true);
    });

    it('should handle profiles with only goalsCount property', () => {
      const profiles = [
        createProfile({ id: 'parent-1', name: 'Parent', goalsCount: 3 }),
      ] as Profile[];

      expect(calculateTotalGoals(profiles)).toBe(3);
      expect(isNewUser(profiles)).toBe(false);
    });
  });

  describe('Real-World Supabase Data Verification', () => {
    it('should correctly process existing user from Supabase', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'de618e2e-092e-489e-899d-845824ebc358',
          name: 'Areen',
          email: 'areen.dev@example.test',
          goalsCount: 2,
          goals: [],
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(2);
      expect(isNewUser(profiles)).toBe(false);
    });

    it('should correctly process new user from Supabase', () => {
      const profiles: Profile[] = [
        createProfile({
          id: 'ff5b5b17-3c26-4111-9a29-46c0dd0ee419',
          name: 'Ahmad',
          email: 'ahmad.dev@example.test',
          goalsCount: 0,
          goals: [],
          avatar: 'avatar-bear',
        }),
      ];

      expect(calculateTotalGoals(profiles)).toBe(0);
      expect(isNewUser(profiles)).toBe(true);
    });
  });
});
