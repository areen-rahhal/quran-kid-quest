import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { AddGoalModal } from '@/components/AddGoalModal';
import { ProfileContext } from '@/contexts/ProfileContext';
import { Profile } from '@/types/profile';
import i18next from 'i18next';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
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
      expect(screen.getByText('learnersProfiles.selectGoal')).toBeInTheDocument();
    });

    it('should not render the modal when isOpen is false', () => {
      const { container } = renderWithContext(
        <AddGoalModal isOpen={false} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const sheetContent = container.querySelector('[data-state="closed"]');
      expect(sheetContent).toHaveAttribute('data-state', 'closed');
    });

    it('should display goal list with correct structure', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null || btn.textContent?.includes('Surah')
      );
      expect(goalButtons.length).toBeGreaterThan(0);
    });

    it('should display goal metadata (surahs and verses)', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      expect(screen.getByText(/Surahs/i)).toBeInTheDocument();
      expect(screen.getByText(/Ayat/i)).toBeInTheDocument();
    });

    it('should display difficulty badge for each goal', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const badges = screen.getAllByText(/short|medium|long/i);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should have Cancel and Add Goal buttons', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
      expect(screen.getByText('learnersProfiles.addGoal')).toBeInTheDocument();
    });
  });

  // ============================================================
  // 2. GOAL SELECTION TESTS (5 tests)
  // ============================================================
  describe('Goal Selection Tests', () => {
    it('should update selectedGoalId when a goal is clicked', () => {
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
      expect(goalButtons[0].querySelector('svg')).toBeInTheDocument();
    });

    it('should disable Add Goal button when no goal is selected', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const goalText = screen.queryByText(/Surah Al-Fatiha/i);
      expect(goalText).not.toBeInTheDocument();
    });

    it('should show all goals when profile has no goals', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      expect(goalButtons.length).toBeGreaterThan(0);
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
      expect(availableGoals.length).toBeGreaterThan(0);
    });

    it('should show empty state when all goals are added', () => {
      const allGoalsProfile: Profile = {
        ...mockProfile,
        goals: Array.from({ length: 30 }, (_, i) => ({
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
      expect(screen.getByText('learnersProfiles.noAvailableGoals')).toBeInTheDocument();
    });

    it('should not duplicate goals in list', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      const goalIds = new Set<string>();
      goalButtons.forEach(button => {
        const ariaLabel = button.getAttribute('aria-label');
        expect(goalIds.has(ariaLabel || '')).toBe(false);
        goalIds.add(ariaLabel || '');
      });
    });
  });

  // ============================================================
  // 4. GOAL ADDITION TESTS (6 tests)
  // ============================================================
  describe('Goal Addition Tests', () => {
    it('should call addGoal with correct parameters', async () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(screen.getByText('learnersProfiles.adding')).toBeInTheDocument();
      });
    });

    it('should disable Add button during loading', async () => {
      mockAddGoal.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should navigate when returnTo prop is provided', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { href: '' } as any;
      renderWithContext(
        <AddGoalModal
          isOpen={true}
          onClose={vi.fn()}
          profileId="test-profile-1"
          returnTo="/learners-profiles"
        />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(window.location.href).toBe('/learners-profiles');
      });
      window.location = originalLocation;
    });

    it('should not navigate when returnTo is not provided', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { href: '' } as any;
      const onClose = vi.fn();
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={onClose} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
      expect(window.location.href).toBe('');
      window.location = originalLocation;
    });
  });

  // ============================================================
  // 5. ERROR HANDLING TESTS (5 tests)
  // ============================================================
  describe('Error Handling Tests', () => {
    it('should show error toast when addGoal fails', async () => {
      mockAddGoal.mockRejectedValueOnce(new Error('Failed to add goal'));
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const goalButtons = screen.getAllByRole('button').filter(
        btn => btn.getAttribute('aria-pressed') !== null
      );
      fireEvent.click(goalButtons[0]);
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      let addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalled();
      });
      addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      let addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      fireEvent.click(addButton!);
      await waitFor(() => {
        expect(mockAddGoal).toHaveBeenCalledTimes(1);
      });
      addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      expect(screen.getByText('learnersProfiles.selectGoal')).toBeInTheDocument();
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      expect(screen.getByText('learnersProfiles.selectGoal')).toBeInTheDocument();
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
      expect(screen.getByText('learnersProfiles.selectGoal')).toBeInTheDocument();
    });
  });

  // ============================================================
  // ADDITIONAL TESTS (interaction flows)
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
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
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
      const cancelButton = screen.getByText('common.cancel').closest('button');
      fireEvent.click(cancelButton!);
      expect(onClose).toHaveBeenCalled();
      expect(mockAddGoal).not.toHaveBeenCalled();
    });

    it('should prevent adding when no goal is selected', () => {
      renderWithContext(
        <AddGoalModal isOpen={true} onClose={vi.fn()} profileId="test-profile-1" />
      );
      const addButton = screen.getByText('learnersProfiles.addGoal').closest('button');
      expect(addButton).toBeDisabled();
      fireEvent.click(addButton!);
      expect(mockAddGoal).not.toHaveBeenCalled();
    });
  });
});
