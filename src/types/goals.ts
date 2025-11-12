export type GoalType = 'juz' | 'surah' | 'surah-group';
export type UnitType = 'surah' | 'surah-section' | 'juz-section';

export interface BaseUnit {
  id: number;
  name: string;
  arabicName: string;
}

export interface GoalMetadata {
  versesCount: number;
  pagesCount: number;
  quartersCount: number;
  surahCount: number;
  defaultUnit: UnitType;
  difficulty: 'short' | 'medium' | 'long';
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

export interface GoalProgress {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'paused';
  completedSurahs?: number;
  totalSurahs?: number;
}
