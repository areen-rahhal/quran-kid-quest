import { GoalProgress, PhaseProgress } from './goals';

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
