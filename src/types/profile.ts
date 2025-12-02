import { GoalProgress } from './goals';

export interface Achievements {
  stars: number;
  streak: number;
  recitations: number;
  goalsCompleted: number;
}

export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  avatar?: string;
  currentGoal?: string;
  goals?: GoalProgress[];
  goalsCount: number;
  email?: string;
  age?: number;
  arabicProficiency?: boolean;
  arabicAccent?: string;
  tajweedLevel?: 'beginner' | 'intermediate' | 'advanced';
  streak?: number;
  achievements?: Achievements;
}

export interface PhaseProgress {
  id: string;
  phaseId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completionDate?: string;
}
