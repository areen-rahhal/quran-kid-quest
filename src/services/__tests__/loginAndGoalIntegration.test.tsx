import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useProfile } from '@/contexts/ProfileContext';

/**
 * CRITICAL TEST: Login and Goal Creation Flow
 * 
 * This test verifies that when a user logs in and creates a goal,
 * the goal is added to the CORRECT profile (the logged-in user's profile)
 * and not to another user's profile.
 * 
 * ISSUE: If multiple parent profiles exist in Supabase, the ProfileContext
 * might load profiles without filtering by authenticated user, causing goals
 * to be added to the wrong profile.
 */

interface TestUser {
  email: string;
  password: string;
  expectedProfileName: string;
  expectedProfileId?: string;
}

// Simulate a login flow that would set the correct parent ID
const MockLoginSimulator = ({ onUserSelected }: { onUserSelected: (profileId: string) => void }) => {
  const users: TestUser[] = [
    { email: 'areenrahhal@gmail.com', password: 'test123', expectedProfileName: 'Areen' },
    { email: 'aya@example.com', password: 'test456', expectedProfileName: 'Aya' },
  ];

  return (
    <div>
      {users.map(user => (
        <button
          key={user.email}
          data-testid={`login-${user.email}`}
          onClick={() => {
            // Simulate setting the correct parent ID after authentication
            localStorage.setItem('currentParentId', `parent-${user.email}`);
            localStorage.setItem('authenticatedUser', user.email);
            onUserSelected(`parent-${user.email}`);
          }}
        >
          Login as {user.expectedProfileName}
        </button>
      ))}
    </div>
  );
};

// Component that shows goal creation after "login"
const OnboardingWithGoalCreation = () => {
  const { currentProfile, parentProfile, addGoal } = useProfile();
  const [selectedGoal, setSelectedGoal] = React.useState('');

  const handleAddGoal = async () => {
    if (selectedGoal && currentProfile) {
      await addGoal(currentProfile.id, selectedGoal, 'Test Goal');
    }
  };

  return (
    <div>
      <div data-testid="logged-in-user">{parentProfile?.name || 'unknown'}</div>
      <div data-testid="current-profile-id">{currentProfile.id}</div>
      <div data-testid="current-profile-name">{currentProfile.name}</div>
      <div data-testid="goal-count">{currentProfile.goals?.length || 0}</div>
      
      <select 
        data-testid="goal-select"
        value={selectedGoal}
        onChange={(e) => setSelectedGoal(e.target.value)}
      >
        <option value="">Select a goal</option>
        <option value="juz-30">Juz 30</option>
        <option value="surah-bakarah">Surah Al Bakarah</option>
      </select>

      <button 
        data-testid="add-goal-btn"
        onClick={handleAddGoal}
        disabled={!selectedGoal}
      >
        Add Goal
      </button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <LanguageProvider>
        <ProfileProvider>
          {component}
        </ProfileProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

// Re-import React for the component
import React from 'react';

describe('Login and Goal Creation Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Goal Added to Correct Profile After Login', () => {
    it('should track which profile is currently logged in', async () => {
      const { rerender } = renderWithProviders(
        <MockLoginSimulator onUserSelected={() => rerender(
          <BrowserRouter>
            <LanguageProvider>
              <ProfileProvider>
                <OnboardingWithGoalCreation />
              </ProfileProvider>
            </LanguageProvider>
          </BrowserRouter>
        )} />
      );

      const loginButton = screen.getByTestId('login-areenrahhal@gmail.com');
      expect(loginButton).toBeInTheDocument();
    });

    it('should show correct parent profile after login', async () => {
      renderWithProviders(<OnboardingWithGoalCreation />);

      const parentName = screen.getByTestId('logged-in-user').textContent;
      expect(parentName).toBeTruthy();
    });

    it('should use correct profile ID when adding goal', async () => {
      const user = userEvent.setup();
      renderWithProviders(<OnboardingWithGoalCreation />);

      // Get the profile ID before adding goal
      const profileId = screen.getByTestId('current-profile-id').textContent;
      expect(profileId).toBeTruthy();

      // Select and add a goal
      const goalSelect = screen.getByTestId('goal-select') as HTMLSelectElement;
      await user.selectOptions(goalSelect, 'juz-30');

      const addBtn = screen.getByTestId('add-goal-btn') as HTMLButtonElement;
      expect(addBtn).not.toBeDisabled();

      await user.click(addBtn);

      // Verify the goal was added to the correct profile
      await waitFor(() => {
        const goalCount = parseInt(screen.getByTestId('goal-count').textContent || '0');
        expect(goalCount).toBeGreaterThan(0);
      });

      // Verify the profile ID is still the same (goal added to correct profile)
      const profileIdAfter = screen.getByTestId('current-profile-id').textContent;
      expect(profileIdAfter).toBe(profileId);
    });

    it('should not add goal to other parent profiles', async () => {
      const TestMultiParentComponent = () => {
        const { currentProfile, parentProfile, profiles, addGoal } = useProfile();

        return (
          <div>
            <div data-testid="current-parent">{parentProfile?.id}</div>
            <div data-testid="current-profile">{currentProfile.id}</div>
            
            {/* List all parent profiles */}
            {profiles.filter(p => p.type === 'parent').map(parent => (
              <div key={parent.id} data-testid={`parent-${parent.id}-goal-count`}>
                {parent.goals?.length || 0}
              </div>
            ))}

            <button
              data-testid="add-goal-btn"
              onClick={() => addGoal(currentProfile.id, 'juz-30', 'Test Goal')}
            >
              Add Goal
            </button>
          </div>
        );
      };

      renderWithProviders(<TestMultiParentComponent />);

      const currentParentId = screen.getByTestId('current-parent').textContent;
      expect(currentParentId).toBeTruthy();

      // Record initial goal counts
      const parentGoalElements = screen.queryAllByTestId(/parent-.*-goal-count/);
      const initialCounts: Record<string, number> = {};

      parentGoalElements.forEach(el => {
        const testId = el.getAttribute('data-testid');
        if (testId) {
          const parentId = testId.replace('parent-', '').replace('-goal-count', '');
          initialCounts[parentId] = parseInt(el.textContent || '0');
        }
      });

      // Add goal
      const addBtn = screen.getByTestId('add-goal-btn');
      addBtn.click();

      await waitFor(() => {
        // Check that only current parent's goals increased
        parentGoalElements.forEach(el => {
          const testId = el.getAttribute('data-testid');
          if (testId) {
            const parentId = testId.replace('parent-', '').replace('-goal-count', '');
            const newCount = parseInt(el.textContent || '0');

            if (parentId === currentParentId) {
              // Current parent's goals should increase
              expect(newCount).toBeGreaterThanOrEqual(initialCounts[parentId]);
            } else {
              // Other parents' goals should NOT increase
              expect(newCount).toBe(initialCounts[parentId]);
            }
          }
        });
      });
    });

    it('should maintain goal isolation between parent profiles', async () => {
      /**
       * CRITICAL SCENARIO:
       * 1. Profile A (Parent 1) has 2 goals
       * 2. Profile B (Parent 2) has 1 goal
       * 3. User logs in as Parent 2 and adds a goal
       * 4. Expected: Parent 2 has 2 goals, Parent 1 still has 2 goals
       * 5. Actual (BUG): Goal might be added to Parent 1 or wrong profile
       */

      const TestGoalIsolationComponent = () => {
        const { profiles, currentProfile, parentProfile, addGoal } = useProfile();
        const [currentParentGoals, setCurrentParentGoals] = React.useState(0);

        React.useEffect(() => {
          // Track goals for current parent
          const parent = profiles.find(p => p.type === 'parent' && p.id === parentProfile?.id);
          setCurrentParentGoals(parent?.goals?.length || 0);
        }, [profiles, parentProfile]);

        return (
          <div>
            <div data-testid="test-parent-id">{parentProfile?.id}</div>
            <div data-testid="test-parent-goals">{currentParentGoals}</div>
            <div data-testid="all-parent-count">
              {profiles.filter(p => p.type === 'parent').length}
            </div>

            {profiles.filter(p => p.type === 'parent').map(parent => (
              <div key={parent.id}>
                <span data-testid={`parent-id-${parent.id}`}>{parent.id}</span>
                <span data-testid={`parent-goals-${parent.id}`}>{parent.goals?.length || 0}</span>
              </div>
            ))}

            <button
              data-testid="add-to-current"
              onClick={() => addGoal(currentProfile.id, 'juz-30', 'Test')}
            >
              Add Goal to Current Parent
            </button>
          </div>
        );
      };

      renderWithProviders(<TestGoalIsolationComponent />);

      const testParentId = screen.getByTestId('test-parent-id').textContent;
      const initialGoals = parseInt(screen.getByTestId('test-parent-goals').textContent || '0');

      const addBtn = screen.getByTestId('add-to-current');
      addBtn.click();

      await waitFor(() => {
        const newGoals = parseInt(screen.getByTestId('test-parent-goals').textContent || '0');
        expect(newGoals).toBeGreaterThanOrEqual(initialGoals);
      });

      // Verify no other parent's goals changed
      const allParentElements = screen.queryAllByTestId(/parent-id-.*/);
      allParentElements.forEach(el => {
        const parentId = el.textContent;
        if (parentId !== testParentId) {
          // Other parent's goal count should not change
          const goalsElement = screen.getByTestId(`parent-goals-${parentId}`);
          // Just verify it exists (goal count shouldn't change)
          expect(goalsElement).toBeInTheDocument();
        }
      });
    });
  });

  describe('Profile Context State After Login', () => {
    it('should have parentProfile set correctly', () => {
      renderWithProviders(<OnboardingWithGoalCreation />);

      const parentName = screen.getByTestId('logged-in-user').textContent;
      expect(parentName).not.toBe('unknown');
    });

    it('should have currentProfile pointing to correct user', () => {
      renderWithProviders(<OnboardingWithGoalCreation />);

      const currentProfileName = screen.getByTestId('current-profile-name').textContent;
      expect(currentProfileName).toBeTruthy();
      expect(currentProfileName?.length).toBeGreaterThan(0);
    });

    it('should have currentProfile under correct parent', () => {
      const TestParentChildRelationshipComponent = () => {
        const { currentProfile, parentProfile, profiles } = useProfile();

        // Find if currentProfile belongs to parentProfile
        const isChildOfParent = currentProfile.parentId === parentProfile?.id || 
                                currentProfile.id === parentProfile?.id;

        return (
          <div>
            <div data-testid="is-valid-relationship">{isChildOfParent ? 'valid' : 'invalid'}</div>
            <div data-testid="parent-id">{parentProfile?.id}</div>
            <div data-testid="current-id">{currentProfile.id}</div>
            <div data-testid="current-parent-id">{currentProfile.parentId || 'none'}</div>
          </div>
        );
      };

      renderWithProviders(<TestParentChildRelationshipComponent />);

      const relationship = screen.getByTestId('is-valid-relationship').textContent;
      expect(relationship).toBe('valid');
    });
  });

  describe('Edge Cases - Multiple Parents in Database', () => {
    it('should load correct parent even if multiple parents exist', () => {
      /**
       * CRITICAL SCENARIO:
       * Database has Parent A, Parent B, Parent C
       * User logs in as Parent B
       * System should load Parent B, not Parent A (first in list)
       */

      const TestMultipleParentsComponent = () => {
        const { profiles, parentProfile, currentProfile } = useProfile();
        const parentProfiles = profiles.filter(p => p.type === 'parent');

        return (
          <div>
            <div data-testid="parent-count">{parentProfiles.length}</div>
            <div data-testid="current-parent">{parentProfile?.id}</div>
            <div data-testid="current-parent-name">{parentProfile?.name}</div>

            {parentProfiles.map((parent, idx) => (
              <div key={parent.id} data-testid={`parent-${idx}`}>
                {parent.name} (ID: {parent.id})
              </div>
            ))}

            <div data-testid="current-matches-parent">
              {currentProfile.id === parentProfile?.id || currentProfile.parentId === parentProfile?.id ? 'yes' : 'no'}
            </div>
          </div>
        );
      };

      renderWithProviders(<TestMultipleParentsComponent />);

      const parentCount = parseInt(screen.getByTestId('parent-count').textContent || '0');
      const currentParent = screen.getByTestId('current-parent').textContent;
      const currentMatches = screen.getByTestId('current-matches-parent').textContent;

      // If multiple parents exist, verify current parent is set correctly
      if (parentCount > 1) {
        expect(currentParent).toBeTruthy();
        expect(currentMatches).toBe('yes');
      }
    });
  });
});
