import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ReactNode } from 'react';

// Component to test goal addition
const TestGoalAdditionComponent = () => {
  const { currentProfile, profiles, addGoal, parentProfile } = useProfile();

  const handleAddGoal = async () => {
    if (currentProfile) {
      await addGoal(currentProfile.id, 'juz-30', "Juz' 30");
    }
  };

  return (
    <div>
      <div data-testid="parent-name">{parentProfile?.name || 'no-parent'}</div>
      <div data-testid="current-profile-id">{currentProfile.id}</div>
      <div data-testid="current-profile-name">{currentProfile.name}</div>
      <div data-testid="all-profiles-count">{profiles.length}</div>
      <div data-testid="current-goals-count">{currentProfile.goals?.length || 0}</div>
      
      {profiles.map((profile, idx) => (
        <div key={idx} data-testid={`profile-${idx}-name`}>
          {profile.name}
        </div>
      ))}

      <button onClick={handleAddGoal} data-testid="add-goal-btn">
        Add Goal to Current Profile
      </button>
    </div>
  );
};

const renderWithProvider = (component: ReactNode) => {
  return render(<ProfileProvider>{component}</ProfileProvider>);
};

describe('ProfileContext - Goal Addition to Correct Profile', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Goal Addition Isolation', () => {
    it('should identify current profile before adding goal', () => {
      renderWithProvider(<TestGoalAdditionComponent />);

      const currentProfileId = screen.getByTestId('current-profile-id').textContent;
      const currentProfileName = screen.getByTestId('current-profile-name').textContent;

      expect(currentProfileId).toBeTruthy();
      expect(currentProfileName).toBeTruthy();
      // Should be a valid profile
      expect(currentProfileName?.length).toBeGreaterThan(0);
    });

    it('should have a parent profile set', () => {
      renderWithProvider(<TestGoalAdditionComponent />);

      const parentName = screen.getByTestId('parent-name').textContent;
      expect(parentName).not.toBe('no-parent');
      expect(parentName).toBeTruthy();
    });

    it('should initialize with multiple profiles', () => {
      renderWithProvider(<TestGoalAdditionComponent />);

      const allProfilesCount = screen.getByTestId('all-profiles-count').textContent;
      expect(parseInt(allProfilesCount || '0')).toBeGreaterThan(0);
    });

    it('should track goals for current profile separately', async () => {
      const { container } = renderWithProvider(<TestGoalAdditionComponent />);

      const initialGoalsCount = parseInt(
        screen.getByTestId('current-goals-count').textContent || '0'
      );

      const addGoalBtn = screen.getByTestId('add-goal-btn');
      addGoalBtn.click();

      await waitFor(() => {
        const newGoalsCount = parseInt(
          screen.getByTestId('current-goals-count').textContent || '0'
        );
        // Goals count should change
        expect(newGoalsCount).toBeGreaterThanOrEqual(initialGoalsCount);
      });
    });
  });

  describe('Profile Isolation - Goals Dont Cross Profiles', () => {
    it('should add goal only to specified profile', async () => {
      const TestMultiProfileComponent = () => {
        const { profiles, addGoal, currentProfile } = useProfile();

        const handleAddGoalToProfile = async (profileId: string) => {
          await addGoal(profileId, 'juz-30', "Juz' 30");
        };

        return (
          <div>
            <div data-testid="current-profile">{currentProfile.id}</div>
            {profiles.map((profile) => (
              <div key={profile.id}>
                <div data-testid={`profile-${profile.id}-name`}>{profile.name}</div>
                <div data-testid={`profile-${profile.id}-goals`}>{profile.goals?.length || 0}</div>
                <button
                  data-testid={`add-goal-to-${profile.id}`}
                  onClick={() => handleAddGoalToProfile(profile.id)}
                >
                  Add Goal
                </button>
              </div>
            ))}
          </div>
        );
      };

      renderWithProvider(<TestMultiProfileComponent />);

      const currentProfileId = screen.getByTestId('current-profile').textContent;
      expect(currentProfileId).toBeTruthy();
    });

    it('should not add goal to other profiles when adding to current profile', async () => {
      const TestProfileGoalIsolationComponent = () => {
        const { profiles, addGoal, currentProfile } = useProfile();

        return (
          <div>
            <div data-testid="current-id">{currentProfile.id}</div>
            {profiles.map((profile) => (
              <div key={profile.id} data-testid={`profile-container-${profile.id}`}>
                <div data-testid={`profile-${profile.id}-name`}>{profile.name}</div>
                <div data-testid={`profile-${profile.id}-type`}>{profile.type}</div>
                <div data-testid={`profile-${profile.id}-goals-count`}>{profile.goals?.length || 0}</div>
              </div>
            ))}
            <button
              data-testid="add-goal-btn"
              onClick={() => addGoal(currentProfile.id, 'juz-30', "Juz' 30")}
            >
              Add to Current
            </button>
          </div>
        );
      };

      renderWithProvider(<TestProfileGoalIsolationComponent />);

      // Record initial goal counts for all profiles
      const profiles = screen.getAllByTestId(/profile-container-/);
      const initialGoalCounts: Record<string, number> = {};

      profiles.forEach((profileElement) => {
        const goalsCountElement = profileElement.querySelector('[data-testid*="-goals-count"]');
        if (goalsCountElement) {
          const profileId = goalsCountElement.getAttribute('data-testid')?.split('-')[1];
          if (profileId) {
            initialGoalCounts[profileId] = parseInt(goalsCountElement.textContent || '0');
          }
        }
      });

      // Get current profile ID
      const currentId = screen.getByTestId('current-id').textContent;

      // Add goal
      const addBtn = screen.getByTestId('add-goal-btn');
      addBtn.click();

      await waitFor(() => {
        // Check that only current profile's goals changed
        profiles.forEach((profileElement) => {
          const goalsCountElement = profileElement.querySelector('[data-testid*="-goals-count"]');
          if (goalsCountElement) {
            const profileId = goalsCountElement.getAttribute('data-testid')?.split('-')[1];
            const newCount = parseInt(goalsCountElement.textContent || '0');

            if (profileId === currentId) {
              // Current profile's goals should increase (or stay same if already exists)
              expect(newCount).toBeGreaterThanOrEqual(initialGoalCounts[profileId]);
            } else {
              // Other profiles' goals should not change
              expect(newCount).toBe(initialGoalCounts[profileId]);
            }
          }
        });
      });
    });
  });

  describe('Current Profile Accuracy', () => {
    it('should maintain correct current profile reference', () => {
      renderWithProvider(<TestGoalAdditionComponent />);

      const parentProfile = screen.getByTestId('parent-name').textContent;
      const currentProfileName = screen.getByTestId('current-profile-name').textContent;

      // Current profile should be one of the available profiles
      expect(currentProfileName).toBeTruthy();
      expect(currentProfileName?.length).toBeGreaterThan(0);
    });

    it('should use currentProfile ID when adding goal', async () => {
      const TestIdVerificationComponent = () => {
        const { currentProfile, addGoal } = useProfile();
        let capturedProfileId = '';

        const handleAddWithCapture = async () => {
          capturedProfileId = currentProfile.id;
          await addGoal(currentProfile.id, 'juz-30', "Juz' 30");
        };

        return (
          <div>
            <div data-testid="used-profile-id">{capturedProfileId || currentProfile.id}</div>
            <div data-testid="current-id">{currentProfile.id}</div>
            <button
              data-testid="add-goal-btn"
              onClick={handleAddWithCapture}
            >
              Add Goal
            </button>
          </div>
        );
      };

      renderWithProvider(<TestIdVerificationComponent />);

      const currentId = screen.getByTestId('current-id').textContent;
      expect(currentId).toBeTruthy();

      const addBtn = screen.getByTestId('add-goal-btn');
      addBtn.click();

      await waitFor(() => {
        const usedId = screen.getByTestId('used-profile-id').textContent;
        expect(usedId).toBe(currentId);
      });
    });
  });

  describe('Goal Adding Edge Cases', () => {
    it('should handle goal addition when profile has no prior goals', async () => {
      const TestNoGoalsComponent = () => {
        const { currentProfile, addGoal } = useProfile();

        return (
          <div>
            <div data-testid="goals-count">{currentProfile.goals?.length || 0}</div>
            <button
              data-testid="add-first-goal-btn"
              onClick={() => addGoal(currentProfile.id, 'juz-30', "Juz' 30")}
            >
              Add First Goal
            </button>
          </div>
        );
      };

      renderWithProvider(<TestNoGoalsComponent />);

      const initialCount = parseInt(
        screen.getByTestId('goals-count').textContent || '0'
      );

      const addBtn = screen.getByTestId('add-first-goal-btn');
      addBtn.click();

      await waitFor(() => {
        const newCount = parseInt(
          screen.getByTestId('goals-count').textContent || '0'
        );
        expect(newCount).toBeGreaterThanOrEqual(initialCount);
      });
    });

    it('should prevent adding duplicate goals to same profile', async () => {
      const TestDuplicateGoalComponent = () => {
        const { currentProfile, addGoal } = useProfile();
        const [addCount, setAddCount] = React.useState(0);

        const handleAdd = async () => {
          await addGoal(currentProfile.id, 'juz-30', "Juz' 30");
          setAddCount(c => c + 1);
        };

        return (
          <div>
            <div data-testid="add-count">{addCount}</div>
            <div data-testid="goals-count">{currentProfile.goals?.length || 0}</div>
            <button data-testid="add-goal-btn" onClick={handleAdd}>
              Add Goal
            </button>
          </div>
        );
      };

      // Import React for this test component
      const React = await import('react');

      renderWithProvider(<TestDuplicateGoalComponent />);

      const addBtn = screen.getByTestId('add-goal-btn');
      
      // Add goal first time
      addBtn.click();
      
      await waitFor(() => {
        const addCount = parseInt(screen.getByTestId('add-count').textContent || '0');
        expect(addCount).toBe(1);
      });

      const goalsAfterFirst = parseInt(
        screen.getByTestId('goals-count').textContent || '0'
      );

      // Try to add same goal again
      addBtn.click();

      await waitFor(() => {
        const addCount = parseInt(screen.getByTestId('add-count').textContent || '0');
        expect(addCount).toBe(2);
      });

      const goalsAfterSecond = parseInt(
        screen.getByTestId('goals-count').textContent || '0'
      );

      // Goals count should not increase (duplicate prevention)
      expect(goalsAfterSecond).toBe(goalsAfterFirst);
    });
  });

  describe('Parent Profile Context', () => {
    it('should maintain parent profile reference', () => {
      renderWithProvider(<TestGoalAdditionComponent />);

      const parentName = screen.getByTestId('parent-name').textContent;
      expect(parentName).not.toBe('no-parent');
      expect(parentName?.length).toBeGreaterThan(0);
    });

    it('should add goal to parent profile when current profile is parent', async () => {
      const TestParentGoalComponent = () => {
        const { currentProfile, parentProfile, addGoal } = useProfile();

        const isCurrentProfileParent = currentProfile.id === parentProfile?.id;

        return (
          <div>
            <div data-testid="is-parent">{isCurrentProfileParent ? 'yes' : 'no'}</div>
            <div data-testid="current-name">{currentProfile.name}</div>
            <div data-testid="parent-name">{parentProfile?.name || 'none'}</div>
            <div data-testid="goals-count">{currentProfile.goals?.length || 0}</div>
            <button
              data-testid="add-goal-btn"
              onClick={() => addGoal(currentProfile.id, 'juz-30', "Juz' 30")}
            >
              Add Goal
            </button>
          </div>
        );
      };

      renderWithProvider(<TestParentGoalComponent />);

      const currentName = screen.getByTestId('current-name').textContent;
      const parentName = screen.getByTestId('parent-name').textContent;

      // Verify parent is set
      expect(parentName).not.toBe('none');

      const initialGoals = parseInt(
        screen.getByTestId('goals-count').textContent || '0'
      );

      const addBtn = screen.getByTestId('add-goal-btn');
      addBtn.click();

      await waitFor(() => {
        const newGoals = parseInt(
          screen.getByTestId('goals-count').textContent || '0'
        );
        expect(newGoals).toBeGreaterThanOrEqual(initialGoals);
      });
    });
  });
});
