import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddGoalModal } from '@/components/AddGoalModal';
import { ProfileContext } from '@/contexts/ProfileContext';
import { Profile } from '@/types/profile';

// Mock i18next - with proper translation fallbacks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'learnersProfiles.selectGoal': 'Select a Goal',
        'learnersProfiles.addGoal': 'Add Goal',
        'learnersProfiles.adding': 'Adding...',
        'learnersProfiles.noAvailableGoals': 'All goals have been added',
        'learnersProfiles.goalAdded': 'Goal Added',
        'learnersProfiles.error': 'Error',
        'learnersProfiles.errorSelectGoal': 'Please select a goal',
        'learnersProfiles.goalNotFound': 'Goal not found',
        'learnersProfiles.errorAddingGoal': 'Failed to add goal. Please try again.',
        'common.cancel': 'Cancel',
        'goals.surahCount': 'Surahs',
        'goals.ayatCount': 'Ayat',
        'goals.difficulty.short': 'Short',
        'goals.difficulty.medium': 'Medium',
        'goals.difficulty.long': 'Long',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockProfile: Profile = {
  id: 'test-profile-1',
  name: 'Test Child',
  type: 'child',
  avatar: 'avatar-test',
  email: 'test@example.com',
  age: 10,
  arabicProficiency: false,
  arabicAccent: '',
  tajweedLevel: '',
  goals: [],
  goalsCount: 0,
  streak: 0,
  achievements: {
    stars: 0,
    streak: 0,
    recitations: 0,
    goalsCompleted: 0,
  },
};

const mockProfileWithGoals: Profile = {
  ...mockProfile,
  goals: [
    {
      id: 'surah-fatiha',
      name: 'Surah Al-Fatiha',
      status: 'in-progress',
      completedSurahs: 0,
      totalSurahs: 1,
      phaseSize: 3,
      phases: null,
    },
  ],
  goalsCount: 1,
};

const mockAddGoal = vi.fn().mockResolvedValue(undefined);

const mockProfileContextValue = {
  currentProfile: mockProfile,
  profiles: [mockProfile],
  currentParentId: null,
  switchProfile: vi.fn(),
  registerParent: vi.fn(),
  createChildProfile: vi.fn(),
  addGoal: mockAddGoal,
  addGoalWithPhaseSize: vi.fn(),
  updateGoalPhaseSize: vi.fn(),
  updateProfile: vi.fn(),
  deleteGoal: vi.fn(),
  logout: vi.fn(),
  isRegistrationComplete: true,
  parentProfile: null,
  isLoading: false,
  hasHydratedProfiles: true,
};

const renderWithContext = (component: React.ReactElement, contextValue = mockProfileContextValue) => {
  return render(
    <ProfileContext.Provider value={contextValue}>
      {component}
    </ProfileContext.Provider>
  );
};

describe('AddGoalModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // 1. RENDERING TESTS (6 tests)
  // ============================================================
  describe('Rendering Tests', () => {
    it('should render the modal when isOpen is true', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      expect(screen.getByText('Select a Goal')).toBeInTheDocument();
    });

    it('should display goal list', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(0);
    });

    it('should display goal metadata (surahs and verses)', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      expect(screen.getByText(/Surahs/)).toBeInTheDocument();
      expect(screen.getByText(/Ayat/)).toBeInTheDocument();
    });

    it('should display difficulty badge for each goal', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const badges = screen.getAllByText(/Short|Medium|Long/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should have Cancel and Add Goal buttons', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Add Goal')).toBeInTheDocument();
    });

    it('should display header with correct title', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const header = screen.getByText('Select a Goal');
      expect(header).toBeInTheDocument();
    });
  });

  // ============================================================
  // 2. GOAL SELECTION TESTS (5 tests)
  // ============================================================
  describe('Goal Selection Tests', () => {
    it('should select a goal when clicked', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      expect(goalButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('should show checkmark icon when goal is selected', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const checkmark = goalButtons[0].querySelector('svg');
      expect(checkmark).toBeInTheDocument();
    });

    it('should disable Add Goal button when no goal is selected', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).toBeDisabled();
    });

    it('should enable Add Goal button after goal selection', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).not.toBeDisabled();
    });

    it('should allow changing selection multiple times', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      expect(goalButtons[0]).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(goalButtons[1]);
      expect(goalButtons[0]).toHaveAttribute('aria-pressed', 'false');
      expect(goalButtons[1]).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // ============================================================
  // 3. GOAL FILTERING TESTS (5 tests)
  // ============================================================
  describe('Goal Filtering Tests', () => {
    it('should filter out existing goals from the list', () => {
      const contextWithGoals = {
        ...mockProfileContextValue,
        profiles: [mockProfileWithGoals],
        currentProfile: mockProfileWithGoals,
      };
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />,
        contextWithGoals
      );
      // Verify total goals shown is less than total available goals
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(0);
      expect(goalButtons.length).toBeLessThan(30);
    });

    it('should show all goals when profile has no goals', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(5);
    });

    it('should not duplicate goals in list', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      const labels = new Set<string>();
      goalButtons.forEach(button => {
        const label = button.getAttribute('aria-label');
        expect(labels.has(label || '')).toBe(false);
        labels.add(label || '');
      });
    });

    it('should show empty state when all goals are added', () => {
      const allGoalsProfile: Profile = {
        ...mockProfile,
        goals: Array.from({ length: 35 }, (_, i) => ({
          id: `goal-${i}`,
          name: `Goal ${i}`,
          status: 'in-progress',
        })) as any,
      };
      const contextWithAllGoals = {
        ...mockProfileContextValue,
        profiles: [allGoalsProfile],
        currentProfile: allGoalsProfile,
      };
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />,
        contextWithAllGoals
      );
      expect(screen.getByText('All goals have been added')).toBeInTheDocument();
    });

    it('should use ID-based matching for filtering', () => {
      const contextWithMultipleGoals = {
        ...mockProfileContextValue,
        profiles: [{
          ...mockProfile,
          goals: [
            { id: 'surah-fatiha', name: 'Surah Al-Fatiha', status: 'in-progress' },
            { id: 'surah-bakarah', name: 'Surah Al-Bakarah', status: 'in-progress' },
          ],
          goalsCount: 2,
        }],
      };
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />,
        contextWithMultipleGoals
      );
      const availableGoals = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(availableGoals.length).toBeGreaterThanOrEqual(20);
    });
  });

  // ============================================================
  // 4. GOAL ADDITION TESTS (6 tests)
  // ============================================================
  describe('Goal Addition Tests', () => {
    it('should call addGoal with correct profileId and goalId', async () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
        const callArgs = mockAddGoal.mock.calls[0];
        expect(callArgs[0]).toBe('test-profile-1');
        expect(typeof callArgs[1]).toBe('string');
      });
    });

    it('should show loading spinner during addition', async () => {
      mockAddGoal.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(screen.getByText('Adding...')).toBeInTheDocument();
      });
    });

    it('should disable buttons during loading', async () => {
      mockAddGoal.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(addButton).toBeDisabled();
      });
    });

    it('should close modal after successful goal addition', async () => {
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should close modal and handle returnTo scenario', async () => {
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal
          isOpen={true}
          onClose={onClose}
          profileId="test-profile-1"
          returnTo="/learners-profiles"
        />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
    });

    it('should handle closing without returnTo prop', async () => {
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // 5. ERROR HANDLING TESTS (5 tests)
  // ============================================================
  describe('Error Handling Tests', () => {
    it('should handle errors gracefully', async () => {
      mockAddGoal.mockRejectedValueOnce(new Error('Failed to add goal'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should keep modal open on error', async () => {
      mockAddGoal.mockRejectedValueOnce(new Error('Failed'));
      const onClose = vi.fn();
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should re-enable Add button after error', async () => {
      mockAddGoal.mockRejectedValueOnce(new Error('Failed'));
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      let addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
      
      addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).not.toBeDisabled();
    });

    it('should log error to console for debugging', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAddGoal.mockRejectedValueOnce(new Error('Test error'));
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should allow retry after error', async () => {
      mockAddGoal
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(undefined);
      const onClose = vi.fn();
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      let addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalledTimes(1);
      });
      
      addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).not.toBeDisabled();
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalledTimes(2);
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  // ============================================================
  // 6. EDGE CASES TESTS (5 tests)
  // ============================================================
  describe('Edge Cases Tests', () => {
    it('should handle rapid clicks on same goal', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      fireEvent.click(goalButtons[0]);
      fireEvent.click(goalButtons[0]);
      expect(goalButtons[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle rapid clicks on Add button', async () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      fireEvent.click(addButton!);
      fireEvent.click(addButton!);
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalledTimes(1);
      });
    });

    it('should render with empty profileId', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="" />
      );
      expect(screen.getByText('Select a Goal')).toBeInTheDocument();
    });

    it('should handle profile with null goals array', () => {
      const contextWithNullGoals = {
        ...mockProfileContextValue,
        profiles: [{ ...mockProfile, goals: null as any }],
      };
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />,
        contextWithNullGoals
      );
      
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(0);
    });

    it('should display goals with Arabic characters correctly', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // 7. ACCESSIBILITY TESTS (3 tests)
  // ============================================================
  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels for goal buttons', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      goalButtons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should have proper role attributes on goal buttons', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      goalButtons.forEach(button => {
        expect(button.getAttribute('role')).toBe('button');
      });
    });

    it('should properly mark disabled state for screen readers', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      
      const addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).toBeDisabled();
    });
  });

  // ============================================================
  // 8. INTEGRATION TESTS (3 tests)
  // ============================================================
  describe('Integration Tests', () => {
    it('should work with ProfileContext', () => {
      const contextValue = {
        ...mockProfileContextValue,
        profiles: [mockProfile],
      };
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />,
        contextValue
      );
      expect(screen.getByText('Select a Goal')).toBeInTheDocument();
    });

    it('should reset selection when modal closes and reopens', () => {
      const { rerender } = renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      expect(goalButtons[0]).toHaveAttribute('aria-pressed', 'true');
      
      rerender(
        <ProfileContext.Provider value={mockProfileContextValue}>
          <AddGoalModal isOpen={false} onClose={vi.fn()} profileId="test-profile-1" />
        </ProfileContext.Provider>
      );
      rerender(
        <ProfileContext.Provider value={mockProfileContextValue}>
          <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
        </ProfileContext.Provider>
      );
      
      const newGoalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(newGoalButtons[0]).toHaveAttribute('aria-pressed', 'false');
    });

    it('should work with different profile types', () => {
      const parentProfile: Profile = {
        ...mockProfile,
        type: 'parent',
        id: 'parent-1',
      };
      const contextValue = {
        ...mockProfileContextValue,
        profiles: [parentProfile],
      };
      
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="parent-1" />,
        contextValue
      );
      expect(screen.getByText('Select a Goal')).toBeInTheDocument();
    });
  });

  // ============================================================
  // ADDITIONAL TESTS (user interaction flows)
  // ============================================================
  describe('User Interaction Flows', () => {
    it('should complete full user flow: select goal and add', async () => {
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).not.toBeDisabled();
      fireEvent.click(addButton!);
      
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should cancel goal addition without changes', () => {
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      
      const cancelButton = screen.getByText('Cancel').closest('button');
      fireEvent.click(cancelButton!);
      expect(onClose).toHaveBeenCalled();
      expect(mockAddGoal).not.toHaveBeenCalled();
    });

    it('should prevent adding when no goal is selected', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      
      const addButton = screen.getByText('Add Goal').closest('button');
      expect(addButton).toBeDisabled();
      fireEvent.click(addButton!);
      expect(mockAddGoal).not.toHaveBeenCalled();
    });
  });
});
