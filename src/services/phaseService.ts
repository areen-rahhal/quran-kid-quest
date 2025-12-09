/**
 * Phase Service
 * Handles generation, management, and tracking of learning phases
 * A phase is a segment of a unit broken down by phase size (verses per phase)
 */

import { BaseUnit } from '@/lib/validation';
import { Phase, PhaseProgress, PhaseStatus, PhaseMetrics } from '@/types/phases';
import { Goal } from '@/types/goals';
import { getGoalById } from '@/config/goals-data';

/**
 * Generate phases from a unit based on phase size
 * Divides the unit's verses into phases of specified size
 * The last phase may contain fewer verses if the total doesn't divide evenly
 */
export function generatePhasesForUnit(unit: BaseUnit, phaseSize: number): Phase[] {
  if (phaseSize <= 0) {
    throw new Error(`Phase size must be positive, got ${phaseSize}`);
  }

  if (unit.versesCount <= 0) {
    throw new Error(`Unit must have positive verse count, got ${unit.versesCount}`);
  }

  // Clamp phase size to unit's verse count
  const effectivePhaseSize = Math.min(phaseSize, unit.versesCount);

  const phases: Phase[] = [];
  const totalVerses = unit.versesCount;
  const numPhases = Math.ceil(totalVerses / effectivePhaseSize);

  // Parse start and end verse to get surah number and actual verse numbers
  const [surahNumber, unitStartVerseNum] = unit.startVerse.split(':').map(Number);
  const [, unitEndVerseNum] = unit.endVerse.split(':').map(Number);

  for (let i = 0; i < numPhases; i++) {
    // Calculate verse positions within the unit
    const relativeStart = i * effectivePhaseSize;
    const relativeEnd = Math.min((i + 1) * effectivePhaseSize - 1, totalVerses - 1);
    const versesCount = relativeEnd - relativeStart + 1;

    // Convert to actual verse numbers in the surah
    const versesStart = unitStartVerseNum + relativeStart;
    const versesEnd = unitStartVerseNum + relativeEnd;

    // Calculate actual verse strings
    const startVerse = `${surahNumber}:${versesStart}`;
    const endVerse = `${surahNumber}:${versesEnd}`;

    const phase: Phase = {
      id: `${unit.id}-phase-${i + 1}`,
      sequenceNumber: i + 1,
      versesStart,
      versesEnd,
      versesCount,
      surahNumber,
      startVerse,
      endVerse,
      arabicName: unit.arabicName ? `${unit.arabicName} - الجزء ${i + 1}` : undefined,
    };

    phases.push(phase);
  }

  return phases;
}

/**
 * Generate phases for all units in a goal
 * Returns a flattened array of all phases across all units
 * Optimized to pre-allocate array and avoid repeated push operations
 */
export function generatePhasesForGoal(goal: Goal, phaseSize: number): Phase[] {
  // Pre-calculate total phases to allocate array once
  let totalPhases = 0;
  const unitPhasesMap: Phase[][] = [];

  for (const unit of goal.units) {
    const unitPhases = generatePhasesForUnit(unit, phaseSize);
    unitPhasesMap.push(unitPhases);
    totalPhases += unitPhases.length;
  }

  // Allocate array with exact capacity needed
  const allPhases: Phase[] = [];
  for (const unitPhases of unitPhasesMap) {
    allPhases.push(...unitPhases);
  }

  return allPhases;
}

/**
 * Get the recommended phase size for a goal
 * Based on goal type and difficulty
 */
export function suggestPhaseSize(goal: Goal, learnerLevel?: string): number {
  const metadata = goal.metadata;

  // If goal has a default phase size, use it
  if (metadata.defaultPhaseSize) {
    return metadata.defaultPhaseSize;
  }

  // Fallback logic based on difficulty
  switch (metadata.difficulty) {
    case 'short':
      return 5; // 5 verses per phase for short goals
    case 'medium':
      return 8; // 8 verses per phase for medium goals
    case 'long':
      return 12; // 12 verses per phase for long goals
    default:
      return 10; // Default fallback
  }
}

/**
 * Initialize phase progress tracking for a unit
 * Creates PhaseProgress objects for each generated phase
 */
export function initializePhaseProgress(unit: BaseUnit, phaseSize: number): PhaseProgress[] {
  const phases = generatePhasesForUnit(unit, phaseSize);

  return phases.map((phase) => ({
    id: `${phase.id}-progress`,
    phaseId: phase.id,
    status: 'not-started' as PhaseStatus,
    completionDate: undefined,
    lastReviewDate: undefined,
    attemptCount: 0,
  }));
}

/**
 * Update a phase's status
 */
export function updatePhaseStatus(
  phases: PhaseProgress[],
  phaseId: string,
  status: PhaseStatus,
): PhaseProgress[] {
  return phases.map((phase) => {
    if (phase.phaseId === phaseId) {
      return {
        ...phase,
        status,
        completionDate: status === 'completed' ? new Date().toISOString() : phase.completionDate,
      };
    }
    return phase;
  });
}

/**
 * Get completion metrics for phases
 */
export function getPhaseMetrics(phases: PhaseProgress[]): PhaseMetrics {
  const completed = phases.filter((p) => p.status === 'completed').length;
  const inProgress = phases.filter((p) => p.status === 'in-progress').length;
  const notStarted = phases.filter((p) => p.status === 'not-started').length;
  const totalPhases = phases.length;
  const completionPercentage = totalPhases > 0 ? Math.round((completed / totalPhases) * 100) : 0;

  return {
    completed,
    inProgress,
    notStarted,
    totalPhases,
    completionPercentage,
  };
}

/**
 * Get the next phase to learn
 * Returns the first not-started phase, or the first in-progress phase
 */
export function getNextPhase(phases: Phase[], phaseProgresses: PhaseProgress[]): Phase | undefined {
  // Find the first not-started phase
  const notStartedProgress = phaseProgresses.find((p) => p.status === 'not-started');
  if (notStartedProgress) {
    return phases.find((p) => p.id === notStartedProgress.phaseId);
  }

  // If all started, return the first in-progress
  const inProgressProgress = phaseProgresses.find((p) => p.status === 'in-progress');
  if (inProgressProgress) {
    return phases.find((p) => p.id === inProgressProgress.phaseId);
  }

  // If all completed, return undefined
  return undefined;
}

/**
 * Get phase by ID
 */
export function getPhaseById(phases: Phase[], phaseId: string): Phase | undefined {
  return phases.find((p) => p.id === phaseId);
}

/**
 * Get all phases for a unit
 */
export function getUnitPhases(phases: Phase[], unitId: number): Phase[] {
  return phases.filter((p) => p.id.includes(`${unitId}-phase`));
}

/**
 * Check if phase size is valid for a unit
 */
export function isValidPhaseSize(unit: BaseUnit, phaseSize: number): boolean {
  return phaseSize > 0 && phaseSize <= unit.versesCount;
}

/**
 * Get suggested phase size range for a unit
 */
export function getPhaseSizeRange(unit: BaseUnit): { min: number; max: number; recommended: number } {
  const versesCount = unit.versesCount;

  // Recommend at least 1 verse per phase, at most all verses
  const min = 1;
  const max = versesCount;

  // Recommended: balance between too many phases and too few
  let recommended = 5;
  if (versesCount <= 10) {
    recommended = Math.max(1, Math.floor(versesCount / 2));
  } else if (versesCount <= 50) {
    recommended = 5;
  } else if (versesCount <= 150) {
    recommended = 10;
  } else {
    recommended = 15;
  }

  return { min, max, recommended };
}

/**
 * Generate phase progress for a goal's current unit on-demand
 * This is called when phases are needed rather than storing them
 */
export function generatePhaseProgressForGoal(goalId: string, phaseSize: number): PhaseProgress[] | null {
  const goalConfig = getGoalById(goalId);

  if (!goalConfig || !goalConfig.units || goalConfig.units.length === 0) {
    return null;
  }

  // Generate phases for the first unit
  return initializePhaseProgress(goalConfig.units[0], phaseSize);
}

/**
 * Service object exporting all phase operations
 */
export const phaseService = {
  generatePhasesForUnit,
  generatePhasesForGoal,
  suggestPhaseSize,
  initializePhaseProgress,
  updatePhaseStatus,
  getPhaseMetrics,
  getNextPhase,
  getPhaseById,
  getUnitPhases,
  isValidPhaseSize,
  getPhaseSizeRange,
  generatePhaseProgressForGoal,
};
