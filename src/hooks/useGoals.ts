import { useMemo } from 'react';
import { getGoalById, getAllGoals } from '@/config/goals-data';
import { Goal } from '@/types/goals';
import { phaseService } from '@/services/phaseService';
import { Phase, PhaseProgress, PhaseMetrics } from '@/types/phases';
import { BaseUnit } from '@/lib/validation';

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

  /**
   * Get phases for a specific unit
   */
  const getUnitPhases = (unit: BaseUnit, phaseSize: number): Phase[] => {
    return phaseService.generatePhasesForUnit(unit, phaseSize);
  };

  /**
   * Get phase metrics for a list of phase progresses
   */
  const getPhaseMetrics = (phaseProgresses: PhaseProgress[]): PhaseMetrics => {
    return phaseService.getPhaseMetrics(phaseProgresses);
  };

  /**
   * Get the next phase to learn
   */
  const getNextPhase = (phases: Phase[], phaseProgresses: PhaseProgress[]): Phase | undefined => {
    return phaseService.getNextPhase(phases, phaseProgresses);
  };

  /**
   * Check if a phase size is valid for a unit
   */
  const isValidPhaseSize = (unit: BaseUnit, phaseSize: number): boolean => {
    return phaseService.isValidPhaseSize(unit, phaseSize);
  };

  /**
   * Get recommended phase size range for a unit
   */
  const getPhraseSizeRange = (unit: BaseUnit) => {
    return phaseService.getPhraseSizeRange(unit);
  };

  return {
    allGoals,
    getGoal,
    getGoalByName,
    getUnitPhases,
    getPhaseMetrics,
    getNextPhase,
    isValidPhaseSize,
    getPhraseSizeRange,
  };
}
