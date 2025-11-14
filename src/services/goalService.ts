import { Profile, GoalProgress } from '@/lib/validation';
import { getGoalById } from '@/config/goals-data';

export const goalService = {
  /**
   * Add a goal to a profile
   */
  addGoalToProfile(
    profile: Profile,
    goalId: string,
    goalName: string
  ): Profile {
    const goalConfig = getGoalById(goalId);
    if (!goalConfig) {
      throw new Error(`Goal with id ${goalId} not found`);
    }

    const totalSurahs = goalConfig.metadata.surahCount || 0;

    const newGoal: GoalProgress = {
      id: goalId,
      name: goalName,
      status: 'in-progress',
      completedSurahs: 0,
      totalSurahs: totalSurahs,
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
};
