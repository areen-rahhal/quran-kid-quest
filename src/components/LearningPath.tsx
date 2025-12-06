/**
 * LearningPath Component
 * Displays a vertical learning path with phase nodes and connectors
 * Shows the learner's journey through a unit broken into phases
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Phase, PhaseProgress, PhaseStatus } from '@/types/phases';
import { BaseUnit } from '@/types/goals';
import PhaseNode from './PhaseNode';
import LearningPathConnector from './LearningPathConnector';

interface LearningPathProps {
  /**
   * The unit being displayed
   */
  unit: BaseUnit;

  /**
   * List of phases for this unit
   */
  phases: Phase[];

  /**
   * Progress tracking for each phase
   */
  phaseProgresses: PhaseProgress[];

  /**
   * Called when a phase node is clicked
   */
  onPhaseSelect?: (phase: Phase) => void;

  /**
   * Currently selected phase ID (for highlighting)
   */
  selectedPhaseId?: string;

  /**
   * Optional CSS classes
   */
  className?: string;

  /**
   * Whether the path is interactive
   */
  isInteractive?: boolean;
}

export const LearningPath = ({
  unit,
  phases,
  phaseProgresses,
  onPhaseSelect,
  selectedPhaseId,
  className = '',
  isInteractive = false,
}: LearningPathProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Build a map of phase progress for quick lookup
  const progressMap = new Map(phaseProgresses.map((p) => [p.phaseId, p]));

  // Calculate metrics
  const completedCount = phaseProgresses.filter((p) => p.status === 'completed').length;
  const inProgressCount = phaseProgresses.filter((p) => p.status === 'in-progress').length;
  const totalPhases = phases.length;
  const completionPercentage = totalPhases > 0 ? Math.round((completedCount / totalPhases) * 100) : 0;

  const getPhaseStatus = (phase: Phase): PhaseStatus => {
    const progress = progressMap.get(phase.id);
    return progress?.status || 'not-started';
  };

  const handlePhaseClick = (phase: Phase) => {
    if (isInteractive && onPhaseSelect) {
      onPhaseSelect(phase);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Learning path container */}
      <div className="relative">
        {/* Vertical connector lines */}
        <LearningPathConnector
          phaseCount={phases.length}
          phaseHeight={150}
          className="text-muted-foreground"
        />

        {/* Phase nodes */}
        <div className="flex flex-col gap-20 items-center pt-4 relative z-10" dir={isArabic ? 'rtl' : 'ltr'}>
          {phases.map((phase, index) => {
            const status = getPhaseStatus(phase);
            const isSelected = selectedPhaseId === phase.id;

            return (
              <div
                key={phase.id}
                className="flex flex-col items-center w-full"
                role="article"
                aria-label={`Phase ${phase.sequenceNumber}`}
              >
                <PhaseNode
                  phase={phase}
                  status={status}
                  onClick={() => handlePhaseClick(phase)}
                  isSelected={isSelected}
                />

                {/* Optional: Show phase details on hover or selected */}
                {isSelected && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center text-sm w-full max-w-xs">
                    <p className="font-semibold text-blue-900">
                      Phase {phase.sequenceNumber}
                    </p>
                    <p className="text-blue-700 text-xs mt-1">
                      {phase.versesCount} verses
                    </p>
                    <p className="text-blue-600 text-xs mt-1">
                      Verses {phase.versesStart}-{phase.versesEnd}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion status message */}
      {completedCount === totalPhases && totalPhases > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-900 font-semibold">
            🎉 Unit Completed!
          </p>
          <p className="text-green-700 text-sm mt-1">
            You've finished all {totalPhases} phases in this unit.
          </p>
        </div>
      )}

      {/* No phases message */}
      {phases.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-muted-foreground">
            No phases available for this unit.
          </p>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
