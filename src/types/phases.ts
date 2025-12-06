export type PhaseStatus = 'not-started' | 'in-progress' | 'completed';
export type LessonType = 'listen' | 'repeat' | 'recall' | 'exercise';

export interface Phase {
  id: string;
  sequenceNumber: number;
  versesStart: number;
  versesEnd: number;
  versesCount: number;
  arabicName?: string;
  surahNumber?: number;
  startVerse?: string;
  endVerse?: string;
}

export interface PhaseProgress {
  id: string;
  phaseId: string;
  status: PhaseStatus;
  completionDate?: string;
  lastReviewDate?: string;
  attemptCount?: number;
}

export interface PhaseMetrics {
  completed: number;
  inProgress: number;
  notStarted: number;
  totalPhases: number;
  completionPercentage: number;
}

export interface LessonProgress {
  id: string;
  lessonId: string;
  phaseId: string;
  type: LessonType;
  status: PhaseStatus;
  completionDate?: string;
  score?: number;
}
