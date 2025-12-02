import { describe, it, expect, beforeEach } from 'vitest';
import { phaseService } from '../phaseService';
import { BaseUnit, Phase, PhaseProgress } from '@/lib/validation';

describe('phaseService', () => {
  let mockUnit: BaseUnit;

  beforeEach(() => {
    mockUnit = {
      id: 1,
      name: 'Al-Fatiha',
      arabicName: 'الفاتحة',
      versesCount: 7,
      startVerse: '1:1',
      endVerse: '1:7',
    };
  });

  describe('generatePhasesForUnit', () => {
    it('should generate phases with correct structure', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);

      expect(phases).toBeDefined();
      expect(phases.length).toBeGreaterThan(0);
      expect(phases[0]).toHaveProperty('id');
      expect(phases[0]).toHaveProperty('sequenceNumber');
      expect(phases[0]).toHaveProperty('versesStart');
      expect(phases[0]).toHaveProperty('versesEnd');
      expect(phases[0]).toHaveProperty('versesCount');
    });

    it('should create correct number of phases', () => {
      // 7 verses with phase size 3 = 3 phases (3, 3, 1)
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      expect(phases.length).toBe(3);
    });

    it('should distribute verses correctly', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);

      expect(phases[0].versesStart).toBe(1);
      expect(phases[0].versesEnd).toBe(3);
      expect(phases[0].versesCount).toBe(3);

      expect(phases[1].versesStart).toBe(4);
      expect(phases[1].versesEnd).toBe(6);
      expect(phases[1].versesCount).toBe(3);

      expect(phases[2].versesStart).toBe(7);
      expect(phases[2].versesEnd).toBe(7);
      expect(phases[2].versesCount).toBe(1);
    });

    it('should handle phase size = 1', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 1);
      expect(phases.length).toBe(7);
      expect(phases.every((p) => p.versesCount === 1)).toBe(true);
    });

    it('should handle phase size = total verses', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 7);
      expect(phases.length).toBe(1);
      expect(phases[0].versesStart).toBe(1);
      expect(phases[0].versesEnd).toBe(7);
      expect(phases[0].versesCount).toBe(7);
    });

    it('should clamp phase size to unit verse count', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 100);
      expect(phases.length).toBe(1);
      expect(phases[0].versesCount).toBe(7);
    });

    it('should throw error for zero phase size', () => {
      expect(() => {
        phaseService.generatePhasesForUnit(mockUnit, 0);
      }).toThrow();
    });

    it('should throw error for negative phase size', () => {
      expect(() => {
        phaseService.generatePhasesForUnit(mockUnit, -5);
      }).toThrow();
    });

    it('should generate correct sequence numbers', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 2);
      phases.forEach((phase, index) => {
        expect(phase.sequenceNumber).toBe(index + 1);
      });
    });

    it('should set correct surah number', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      phases.forEach((phase) => {
        expect(phase.surahNumber).toBe(1);
      });
    });

    it('should generate correct verse strings', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      expect(phases[0].startVerse).toBe('1:1');
      expect(phases[0].endVerse).toBe('1:3');
      expect(phases[1].startVerse).toBe('1:4');
      expect(phases[1].endVerse).toBe('1:6');
    });

    it('should handle large units correctly', () => {
      const largeUnit: BaseUnit = {
        ...mockUnit,
        versesCount: 286,
        endVerse: '2:286',
      };
      const phases = phaseService.generatePhasesForUnit(largeUnit, 10);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(286);
    });

    it('should handle uneven division correctly', () => {
      // 10 verses, phase size 3 = 4 phases (3, 3, 3, 1)
      const unit: BaseUnit = {
        ...mockUnit,
        versesCount: 10,
        endVerse: '1:10',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 3);
      expect(phases.length).toBe(4);
      expect(phases[phases.length - 1].versesCount).toBe(1);
    });
  });

  describe('generatePhasesForGoal', () => {
    it('should generate phases for all units in goal', () => {
      const mockGoal = {
        id: 'test-goal',
        nameEnglish: 'Test Goal',
        nameArabic: 'اختبار الهدف',
        type: 'surah-xsmall' as const,
        metadata: {
          versesCount: 14,
          pagesCount: 2,
          quartersCount: 1,
          surahCount: 2,
          defaultUnit: 'surah' as const,
          difficulty: 'short' as const,
          defaultPhaseSize: 3,
          supportsCustomPhaseSize: true,
        },
        units: [mockUnit, { ...mockUnit, id: 2, versesCount: 7 }],
      };

      const phases = phaseService.generatePhasesForGoal(mockGoal, 3);
      expect(phases.length).toBeGreaterThan(0);
      expect(phases.every((p) => p.id)).toBe(true);
    });
  });

  describe('initializePhaseProgress', () => {
    it('should create progress for all phases', () => {
      const progress = phaseService.initializePhaseProgress(mockUnit, 3);
      expect(progress.length).toBe(3);
    });

    it('should set all to not-started status', () => {
      const progress = phaseService.initializePhaseProgress(mockUnit, 3);
      expect(progress.every((p) => p.status === 'not-started')).toBe(true);
    });

    it('should have correct phase IDs', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      const progress = phaseService.initializePhaseProgress(mockUnit, 3);

      progress.forEach((p, index) => {
        expect(p.phaseId).toBe(phases[index].id);
      });
    });
  });

  describe('updatePhaseStatus', () => {
    let progress: PhaseProgress[];

    beforeEach(() => {
      progress = phaseService.initializePhaseProgress(mockUnit, 3);
    });

    it('should update specific phase status', () => {
      const phaseId = progress[0].phaseId;
      const updated = phaseService.updatePhaseStatus(progress, phaseId, 'in-progress');

      expect(updated[0].status).toBe('in-progress');
      expect(updated[1].status).toBe('not-started');
    });

    it('should set completion date when marking completed', () => {
      const phaseId = progress[0].phaseId;
      const updated = phaseService.updatePhaseStatus(progress, phaseId, 'completed');

      expect(updated[0].status).toBe('completed');
      expect(updated[0].completionDate).toBeDefined();
    });

    it('should not modify original array', () => {
      const originalStatus = progress[0].status;
      phaseService.updatePhaseStatus(progress, progress[0].phaseId, 'completed');

      expect(progress[0].status).toBe(originalStatus);
    });
  });

  describe('getPhaseMetrics', () => {
    it('should calculate metrics correctly', () => {
      let progress = phaseService.initializePhaseProgress(mockUnit, 3);

      // Mark first as completed, second as in-progress
      progress = phaseService.updatePhaseStatus(progress, progress[0].phaseId, 'completed');
      progress = phaseService.updatePhaseStatus(progress, progress[1].phaseId, 'in-progress');

      const metrics = phaseService.getPhaseMetrics(progress);

      expect(metrics.completed).toBe(1);
      expect(metrics.inProgress).toBe(1);
      expect(metrics.notStarted).toBe(1);
      expect(metrics.totalPhases).toBe(3);
      expect(metrics.completionPercentage).toBe(33);
    });

    it('should return 0 for empty phases', () => {
      const metrics = phaseService.getPhaseMetrics([]);
      expect(metrics.completed).toBe(0);
      expect(metrics.totalPhases).toBe(0);
      expect(metrics.completionPercentage).toBe(0);
    });

    it('should return 100% when all completed', () => {
      let progress = phaseService.initializePhaseProgress(mockUnit, 3);
      progress = progress.map((p) => ({
        ...p,
        status: 'completed' as const,
      }));

      const metrics = phaseService.getPhaseMetrics(progress);
      expect(metrics.completionPercentage).toBe(100);
    });
  });

  describe('getNextPhase', () => {
    it('should return first not-started phase', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      const progress = phaseService.initializePhaseProgress(mockUnit, 3);

      const next = phaseService.getNextPhase(phases, progress);
      expect(next).toBeDefined();
      expect(next?.sequenceNumber).toBe(1);
    });

    it('should return in-progress phase if no not-started', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      let progress = phaseService.initializePhaseProgress(mockUnit, 3);

      // Mark all as started
      progress = progress.map((p, index) => ({
        ...p,
        status: index === 1 ? ('in-progress' as const) : ('completed' as const),
      }));

      const next = phaseService.getNextPhase(phases, progress);
      expect(next?.sequenceNumber).toBe(2);
    });

    it('should return undefined if all completed', () => {
      const phases = phaseService.generatePhasesForUnit(mockUnit, 3);
      let progress = phaseService.initializePhaseProgress(mockUnit, 3);

      progress = progress.map((p) => ({
        ...p,
        status: 'completed' as const,
      }));

      const next = phaseService.getNextPhase(phases, progress);
      expect(next).toBeUndefined();
    });
  });

  describe('isValidPhaseSize', () => {
    it('should validate positive phase size', () => {
      expect(phaseService.isValidPhaseSize(mockUnit, 1)).toBe(true);
      expect(phaseService.isValidPhaseSize(mockUnit, 7)).toBe(true);
    });

    it('should reject zero phase size', () => {
      expect(phaseService.isValidPhaseSize(mockUnit, 0)).toBe(false);
    });

    it('should reject negative phase size', () => {
      expect(phaseService.isValidPhaseSize(mockUnit, -1)).toBe(false);
    });

    it('should reject phase size larger than unit', () => {
      expect(phaseService.isValidPhaseSize(mockUnit, 10)).toBe(false);
    });
  });

  describe('getPhraseSizeRange', () => {
    it('should return valid range', () => {
      const range = phaseService.getPhraseSizeRange(mockUnit);
      expect(range.min).toBe(1);
      expect(range.max).toBe(mockUnit.versesCount);
      expect(range.recommended).toBeGreaterThan(0);
    });

    it('should have reasonable recommended size', () => {
      const range = phaseService.getPhraseSizeRange(mockUnit);
      expect(range.recommended).toBeGreaterThanOrEqual(range.min);
      expect(range.recommended).toBeLessThanOrEqual(range.max);
    });
  });
});
