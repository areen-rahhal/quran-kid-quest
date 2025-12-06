import { Profile, GoalProgress } from '@/lib/validation';
import { getGoalById } from '@/config/goals-data';
import { phaseService } from './phaseService';
import { PhaseProgress } from '@/types/phases';

export const goalService = {
  /**
   * Add a goal to a profile with phase initialization
   * @param profile - The learner's profile
   * @param goalId - The goal to add
   * @param goalName - The goal's display name
   * @param phaseSize - Optional custom phase size (defaults to goal's defaultPhaseSize)
   */
  addGoalToProfile(
    profile: Profile,
    goalId: string,
    goalName: string,
    phaseSize?: number
  ): Profile {
    const goalConfig = getGoalById(goalId);
    if (!goalConfig) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    const totalSurahs = goalConfig.metadata.surahCount || 0;

    // Determine phase size
    const effectivePhaseSize = phaseSize || goalConfig.metadata.defaultPhaseSize;

    // Don't store phases in localStorage - generate on-demand instead
    // This prevents localStorage quota exceeded errors
    const newGoal: GoalProgress = {
      id: goalId,
      name: goalName,
      status: 'in-progress',
      completedSurahs: 0,
      totalSurahs: totalSurahs,
      phaseSize: effectivePhaseSize,
      phases: null,
      currentUnitId: goalConfig.units?.[0]?.id.toString(),
    };

    const updatedGoals = [...(profile.goals || []), newGoal];

    return {
      ...profile,
      goals: updatedGoals,
      goalsCount: updatedGoals.length,
      currentGoal: goalName,
    };
  },

  /**
   * Remove a goal from a profile
   */
  removeGoalFromProfile(profile: Profile, goalId: string): Profile {
    const updatedGoals = (profile.goals || []).filter(
      (goal) => goal.id !== goalId
    );

    return {
      ...profile,
      goals: updatedGoals,
      goalsCount: updatedGoals.length,
      currentGoal:
        updatedGoals.length > 0 ? updatedGoals[0]?.name : undefined,
    };
  },

  /**
   * Update a goal's progress in a profile
   */
  updateGoalProgress(
    profile: Profile,
    goalId: string,
    updates: Partial<GoalProgress>
  ): Profile {
    const updatedGoals = (profile.goals || []).map((goal) => {
      if (goal.id === goalId) {
        return { ...goal, ...updates };
      }
      return goal;
    });

    return {
      ...profile,
      goals: updatedGoals,
    };
  },

  /**
   * Get a specific goal from profile
   */
  getGoalFromProfile(
    profile: Profile,
    goalId: string
  ): GoalProgress | undefined {
    return (profile.goals || []).find((goal) => goal.id === goalId);
  },

  /**
   * Check if profile has a goal
   */
  hasGoal(profile: Profile, goalId: string): boolean {
    return (profile.goals || []).some((goal) => goal.id === goalId);
  },

  /**
   * Mark goal as completed
   */
  completeGoal(profile: Profile, goalId: string): Profile {
    return this.updateGoalProgress(profile, goalId, {
      status: 'completed',
    });
  },

  /**
   * Pause goal
   */
  pauseGoal(profile: Profile, goalId: string): Profile {
    return this.updateGoalProgress(profile, goalId, {
      status: 'paused',
    });
  },

  /**
   * Resume goal
   */
  resumeGoal(profile: Profile, goalId: string): Profile {
    return this.updateGoalProgress(profile, goalId, {
      status: 'in-progress',
    });
  },

  /**
   * Update phase size for a goal and regenerate phases
   * @param profile - The learner's profile
   * @param goalId - The goal to update
   * @param newPhaseSize - The new phase size
   * @param unitId - Optional: only regenerate phases for this unit (defaults to current unit)
   */
  updateGoalPhaseSize(
    profile: Profile,
    goalId: string,
    newPhaseSize: number,
    unitId?: number
  ): Profile {
    const goalConfig = getGoalById(goalId);
    if (!goalConfig) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    if (newPhaseSize <= 0) {
      throw new Error(`Phase size must be positive, got ${newPhaseSize}`);
    }

    // Determine which unit to regenerate phases for
    let targetUnitId = unitId;
    if (!targetUnitId && goalConfig.units && goalConfig.units.length > 0) {
      targetUnitId = goalConfig.units[0].id;
    }

    // Find the unit and regenerate phases
    const targetUnit = goalConfig.units?.find((u) => u.id === targetUnitId);
    if (!targetUnit) {
      throw new Error(`Unit ${targetUnitId} not found in goal ${goalId}`);
    }

    const newPhases = phaseService.initializePhaseProgress(targetUnit, newPhaseSize);

    return this.updateGoalProgress(profile, goalId, {
      phaseSize: newPhaseSize,
      phases: newPhases,
    });
  },

  /**
   * Update phases for a goal
   */
  updateGoalPhases(
    profile: Profile,
    goalId: string,
    phases: PhaseProgress[]
  ): Profile {
    return this.updateGoalProgress(profile, goalId, {
      phases,
    });
  },

  /**
   * Get phase metrics for a goal
   */
  getGoalPhaseMetrics(profile: Profile, goalId: string) {
    const goal = this.getGoalFromProfile(profile, goalId);
    if (!goal || !goal.phases) {
      return null;
    }
    return phaseService.getPhaseMetrics(goal.phases);
  },
};
