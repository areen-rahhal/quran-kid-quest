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

  describe('getPhaseSizeRange', () => {
    it('should return valid range', () => {
      const range = phaseService.getPhaseSizeRange(mockUnit);
      expect(range.min).toBe(1);
      expect(range.max).toBe(mockUnit.versesCount);
      expect(range.recommended).toBeGreaterThan(0);
    });

    it('should have reasonable recommended size', () => {
      const range = phaseService.getPhaseSizeRange(mockUnit);
      expect(range.recommended).toBeGreaterThanOrEqual(range.min);
      expect(range.recommended).toBeLessThanOrEqual(range.max);
    });
  });

  describe('Different Phase Sizes (3, 5, 8, 10)', () => {
    it('should correctly handle phase size 3', () => {
      const unit: BaseUnit = {
        ...mockUnit,
        versesCount: 23,
        endVerse: '55:41',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 3);
      expect(phases.length).toBe(8);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(23);
      phases.forEach((phase) => {
        expect(phase.versesCount).toBeLessThanOrEqual(3);
        expect(phase.versesCount).toBeGreaterThan(0);
      });
    });

    it('should correctly handle phase size 5', () => {
      const unit: BaseUnit = {
        ...mockUnit,
        versesCount: 52,
        endVerse: '68:52',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 5);
      expect(phases.length).toBe(11);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(52);
      phases.forEach((phase) => {
        expect(phase.versesCount).toBeLessThanOrEqual(5);
        expect(phase.versesCount).toBeGreaterThan(0);
      });
    });

    it('should correctly handle phase size 8', () => {
      const unit: BaseUnit = {
        ...mockUnit,
        versesCount: 110,
        endVerse: '18:110',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 8);
      expect(phases.length).toBe(14);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(110);
      phases.forEach((phase) => {
        expect(phase.versesCount).toBeLessThanOrEqual(8);
        expect(phase.versesCount).toBeGreaterThan(0);
      });
    });

    it('should correctly handle phase size 10', () => {
      const unit: BaseUnit = {
        ...mockUnit,
        versesCount: 286,
        endVerse: '2:286',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 10);
      expect(phases.length).toBe(29);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(286);
      phases.forEach((phase) => {
        expect(phase.versesCount).toBeLessThanOrEqual(10);
        expect(phase.versesCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Small Unit Edge Cases (3-7 verses)', () => {
    it('should handle 3-verse unit (Al-Asr) with phase size 3', () => {
      const unit: BaseUnit = {
        id: 103,
        name: 'Al-Asr',
        arabicName: 'العصر',
        versesCount: 3,
        startVerse: '103:1',
        endVerse: '103:3',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 3);
      expect(phases.length).toBe(1);
      expect(phases[0].versesCount).toBe(3);
      expect(phases[0].versesStart).toBe(1);
      expect(phases[0].versesEnd).toBe(3);
    });

    it('should handle 3-verse unit with phase size 1', () => {
      const unit: BaseUnit = {
        id: 103,
        name: 'Al-Asr',
        arabicName: 'العصر',
        versesCount: 3,
        startVerse: '103:1',
        endVerse: '103:3',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 1);
      expect(phases.length).toBe(3);
      expect(phases.every((p) => p.versesCount === 1)).toBe(true);
    });

    it('should handle 5-verse unit (Al-Qadr) with phase size 3', () => {
      const unit: BaseUnit = {
        id: 97,
        name: 'Al-Qadr',
        arabicName: 'القدر',
        versesCount: 5,
        startVerse: '97:1',
        endVerse: '97:5',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 3);
      expect(phases.length).toBe(2);
      expect(phases[0].versesCount).toBe(3);
      expect(phases[1].versesCount).toBe(2);
    });

    it('should handle 7-verse unit with different phase sizes', () => {
      const unit = mockUnit;

      // Phase size 2
      const phases2 = phaseService.generatePhasesForUnit(unit, 2);
      expect(phases2.length).toBe(4);

      // Phase size 3
      const phases3 = phaseService.generatePhasesForUnit(unit, 3);
      expect(phases3.length).toBe(3);

      // Phase size 7
      const phases7 = phaseService.generatePhasesForUnit(unit, 7);
      expect(phases7.length).toBe(1);
    });
  });

  describe('Large Unit Edge Cases (50+ verses)', () => {
    it('should handle 52-verse unit (Al-Qalam) with phase size 5', () => {
      const unit: BaseUnit = {
        id: 68,
        name: 'Al-Qalam',
        arabicName: 'القلم',
        versesCount: 52,
        startVerse: '68:1',
        endVerse: '68:52',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 5);
      expect(phases.length).toBe(11);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(52);

      // Verify no gaps or overlaps
      let expectedStart = 1;
      phases.forEach((phase) => {
        expect(phase.versesStart).toBe(expectedStart);
        expectedStart = phase.versesEnd + 1;
      });
      expect(expectedStart - 1).toBe(52);
    });

    it('should handle 56-verse unit (Al-Muddathir) with phase size 5', () => {
      const unit: BaseUnit = {
        id: 74,
        name: 'Al-Muddathir',
        arabicName: 'المدثر',
        versesCount: 56,
        startVerse: '74:1',
        endVerse: '74:56',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 5);
      expect(phases.length).toBe(12);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(56);
    });

    it('should handle 100+ verse unit', () => {
      const unit: BaseUnit = {
        id: 2,
        name: 'Surah Al-Bakarah',
        arabicName: 'سورة البقرة',
        versesCount: 286,
        startVerse: '2:1',
        endVerse: '2:286',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 10);
      expect(phases.length).toBe(29);
      const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
      expect(totalVerses).toBe(286);
    });
  });

  describe('Non-1 Starting Verses', () => {
    it('should correctly handle unit starting at verse 19', () => {
      const unit: BaseUnit = {
        id: 5502,
        name: 'Page 2',
        arabicName: 'الصفحة الثانية',
        versesCount: 23,
        startVerse: '55:19',
        endVerse: '55:41',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 8);
      expect(phases.length).toBe(3);

      expect(phases[0].versesStart).toBe(19);
      expect(phases[0].versesEnd).toBe(26);
      expect(phases[0].versesCount).toBe(8);

      expect(phases[1].versesStart).toBe(27);
      expect(phases[1].versesEnd).toBe(34);
      expect(phases[1].versesCount).toBe(8);

      expect(phases[2].versesStart).toBe(35);
      expect(phases[2].versesEnd).toBe(41);
      expect(phases[2].versesCount).toBe(7);
    });

    it('should correctly generate verse strings for non-1 starting verses', () => {
      const unit: BaseUnit = {
        id: 5502,
        name: 'Page 2',
        arabicName: 'الصفحة الثانية',
        versesCount: 23,
        startVerse: '55:19',
        endVerse: '55:41',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 8);

      expect(phases[0].startVerse).toBe('55:19');
      expect(phases[0].endVerse).toBe('55:26');
      expect(phases[1].startVerse).toBe('55:27');
      expect(phases[1].endVerse).toBe('55:34');
    });

    it('should handle units starting at various verses', () => {
      const unit: BaseUnit = {
        id: 212,
        name: 'Quarter 12',
        arabicName: 'الربع الثاني عشر',
        versesCount: 14,
        startVerse: '2:189',
        endVerse: '2:202',
      };
      const phases = phaseService.generatePhasesForUnit(unit, 5);

      expect(phases[0].versesStart).toBe(189);
      expect(phases[0].versesEnd).toBe(193);
      expect(phases[0].startVerse).toBe('2:189');
      expect(phases[0].endVerse).toBe('2:193');
    });
  });

  describe('Real-World Data Validation', () => {
    it('should correctly handle all Juz 30 units with phase size 3', () => {
      // Sample units from Juz' 30
      const juz30Units: BaseUnit[] = [
        {
          id: 78,
          name: 'An-Naba',
          arabicName: 'النبأ',
          versesCount: 40,
          startVerse: '78:1',
          endVerse: '78:40',
        },
        {
          id: 103,
          name: 'Al-Asr',
          arabicName: 'العصر',
          versesCount: 3,
          startVerse: '103:1',
          endVerse: '103:3',
        },
        {
          id: 114,
          name: 'An-Nas',
          arabicName: 'الناس',
          versesCount: 6,
          startVerse: '114:1',
          endVerse: '114:6',
        },
      ];

      juz30Units.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 3);
        const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
        expect(totalVerses).toBe(unit.versesCount);

        // Verify no gaps
        let expectedStart = parseInt(unit.startVerse.split(':')[1]);
        phases.forEach((phase) => {
          expect(phase.versesStart).toBe(expectedStart);
          expectedStart = phase.versesEnd + 1;
        });
      });
    });

    it('should correctly handle all Juz 29 units with phase size 5', () => {
      // Sample units from Juz' 29
      const juz29Units: BaseUnit[] = [
        {
          id: 67,
          name: 'Al-Mulk',
          arabicName: 'الملك',
          versesCount: 30,
          startVerse: '67:1',
          endVerse: '67:30',
        },
        {
          id: 74,
          name: 'Al-Muddathir',
          arabicName: 'المدثر',
          versesCount: 56,
          startVerse: '74:1',
          endVerse: '74:56',
        },
      ];

      juz29Units.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 5);
        const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
        expect(totalVerses).toBe(unit.versesCount);
      });
    });

    it('should correctly handle Bakarah quarters with phase size 10', () => {
      // Sample quarters from Bakarah
      const bakarahQuarters: BaseUnit[] = [
        {
          id: 201,
          name: 'Quarter 1',
          arabicName: 'الربع الأول',
          versesCount: 25,
          startVerse: '2:1',
          endVerse: '2:25',
        },
        {
          id: 202,
          name: 'Quarter 2',
          arabicName: 'الربع الثاني',
          versesCount: 18,
          startVerse: '2:26',
          endVerse: '2:43',
        },
        {
          id: 220,
          name: 'Quarter 20',
          arabicName: 'الربع العشرون',
          versesCount: 4,
          startVerse: '2:283',
          endVerse: '2:286',
        },
      ];

      bakarahQuarters.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 10);
        const totalVerses = phases.reduce((sum, p) => sum + p.versesCount, 0);
        expect(totalVerses).toBe(unit.versesCount);
      });
    });
  });

  describe('Multi-Unit Goals', () => {
    it('should generate unique phase IDs across multiple units', () => {
      const units: BaseUnit[] = [
        {
          id: 103,
          name: 'Al-Asr',
          arabicName: 'العصر',
          versesCount: 3,
          startVerse: '103:1',
          endVerse: '103:3',
        },
        {
          id: 104,
          name: 'Al-Humazah',
          arabicName: 'الهمزة',
          versesCount: 9,
          startVerse: '104:1',
          endVerse: '104:9',
        },
        {
          id: 105,
          name: 'Al-Fil',
          arabicName: 'الفيل',
          versesCount: 5,
          startVerse: '105:1',
          endVerse: '105:5',
        },
      ];

      const allPhaseIds: Set<string> = new Set();
      units.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 3);
        phases.forEach((phase) => {
          expect(allPhaseIds.has(phase.id)).toBe(false);
          allPhaseIds.add(phase.id);
        });
      });

      expect(allPhaseIds.size).toBeGreaterThan(0);
    });

    it('should not cross unit boundaries in multi-unit goals', () => {
      const units: BaseUnit[] = [
        {
          id: 103,
          name: 'Al-Asr',
          arabicName: 'العصر',
          versesCount: 3,
          startVerse: '103:1',
          endVerse: '103:3',
        },
        {
          id: 104,
          name: 'Al-Humazah',
          arabicName: 'الهمزة',
          versesCount: 9,
          startVerse: '104:1',
          endVerse: '104:9',
        },
      ];

      units.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 5);
        phases.forEach((phase) => {
          // Verify phase surah matches unit surah
          expect(phase.surahNumber).toBe(parseInt(unit.startVerse.split(':')[0]));
          // Verify phase verses are within unit range
          expect(phase.versesStart).toBeGreaterThanOrEqual(
            parseInt(unit.startVerse.split(':')[1])
          );
          expect(phase.versesEnd).toBeLessThanOrEqual(
            parseInt(unit.endVerse.split(':')[1])
          );
        });
      });
    });

    it('should handle Juz 30 with multiple diverse units', () => {
      const juz30Units: BaseUnit[] = [
        { id: 78, name: 'An-Naba', arabicName: 'النبأ', versesCount: 40, startVerse: '78:1', endVerse: '78:40' },
        { id: 79, name: 'An-Nazi\'at', arabicName: 'النازعات', versesCount: 46, startVerse: '79:1', endVerse: '79:46' },
        { id: 80, name: 'Abasa', arabicName: 'عبس', versesCount: 42, startVerse: '80:1', endVerse: '80:42' },
        { id: 103, name: 'Al-Asr', arabicName: 'العصر', versesCount: 3, startVerse: '103:1', endVerse: '103:3' },
        { id: 114, name: 'An-Nas', arabicName: 'الناس', versesCount: 6, startVerse: '114:1', endVerse: '114:6' },
      ];

      let totalPhases = 0;
      let totalVerses = 0;

      juz30Units.forEach((unit) => {
        const phases = phaseService.generatePhasesForUnit(unit, 3);
        totalPhases += phases.length;
        totalVerses += phases.reduce((sum, p) => sum + p.versesCount, 0);
      });

      expect(totalPhases).toBeGreaterThan(0);
      expect(totalVerses).toBe(137); // Sum of all verses in sample units
    });
  });

  describe('Phase Progress Initialization', () => {
    it('should initialize correct number of phases for small units', () => {
      const smallUnit: BaseUnit = {
        id: 103,
        name: 'Al-Asr',
        arabicName: 'العصر',
        versesCount: 3,
        startVerse: '103:1',
        endVerse: '103:3',
      };

      const progress = phaseService.initializePhaseProgress(smallUnit, 3);
      expect(progress.length).toBe(1);
    });

    it('should initialize correct number of phases for large units', () => {
      const largeUnit: BaseUnit = {
        id: 2,
        name: 'Surah Al-Bakarah',
        arabicName: 'سورة البقرة',
        versesCount: 286,
        startVerse: '2:1',
        endVerse: '2:286',
      };

      const progress = phaseService.initializePhaseProgress(largeUnit, 10);
      expect(progress.length).toBe(29);
    });

    it('should initialize all phases with not-started status', () => {
      const units: BaseUnit[] = [
        {
          id: 103,
          name: 'Al-Asr',
          arabicName: 'العصر',
          versesCount: 3,
          startVerse: '103:1',
          endVerse: '103:3',
        },
        {
          id: 74,
          name: 'Al-Muddathir',
          arabicName: 'المدثر',
          versesCount: 56,
          startVerse: '74:1',
          endVerse: '74:56',
        },
      ];

      units.forEach((unit) => {
        [1, 3, 5, 8, 10].forEach((phaseSize) => {
          const progress = phaseService.initializePhaseProgress(unit, phaseSize);
          expect(progress.every((p) => p.status === 'not-started')).toBe(true);
        });
      });
    });

    it('should maintain phase ID consistency between generation and progress', () => {
      const unit: BaseUnit = {
        id: 68,
        name: 'Al-Qalam',
        arabicName: 'القلم',
        versesCount: 52,
        startVerse: '68:1',
        endVerse: '68:52',
      };

      const phases = phaseService.generatePhasesForUnit(unit, 5);
      const progress = phaseService.initializePhaseProgress(unit, 5);

      expect(phases.length).toBe(progress.length);
      phases.forEach((phase, index) => {
        expect(progress[index].phaseId).toBe(phase.id);
      });
    });
  });
});
