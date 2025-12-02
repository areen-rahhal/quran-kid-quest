export type GoalType = 'juz' | 'surah-xlong' | 'surah-long' | 'surah-medium' | 'surah-small' | 'surah-xsmall' | 'group';
export type UnitType = 'surah' | 'quarter' | 'page';

export interface BaseUnit {
  id: number;
  name: string;
  arabicName: string;
  versesCount: number;
  startVerse: string;
  endVerse: string;
}

export interface GoalMetadata {
  versesCount: number;
  pagesCount: number;
  quartersCount: number;
  surahCount: number;
  defaultUnit: UnitType;
  difficulty: 'short' | 'medium' | 'long';
  defaultPhaseSize: number;
  supportsCustomPhaseSize: boolean;
}

export interface Goal {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  type: GoalType;
  metadata: GoalMetadata;
  units: BaseUnit[];
  description?: string;
}

import type { PhaseProgress } from './phases';

export interface GoalProgress {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'paused';
  completedSurahs?: number;
  totalSurahs?: number;
  phaseSize?: number;
  phases?: PhaseProgress[];
  completionDate?: string;
  currentUnitId?: string;
}
