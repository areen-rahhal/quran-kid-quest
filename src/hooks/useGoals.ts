import { useMemo } from 'react';
import { getGoalById, getAllGoals } from '@/config/goals-data';
import { Goal } from '@/types/goals';

export function useGoals() {
  const allGoals = useMemo(() => getAllGoals(), []);

  const getGoal = (goalId: string): Goal | undefined => {
    return getGoalById(goalId);
  };

  const getGoalByName = (name: string): Goal | undefined => {
    return allGoals.find(
      goal => goal.nameEnglish === name || goal.nameArabic === name
    );
  };

  return {
    allGoals,
    getGoal,
    getGoalByName,
  };
}
