export interface Goal {
  id: string;
  name: string;
  status: 'in-progress' | 'completed' | 'paused';
  completedSurahs?: number;
  totalSurahs?: number;
}

export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  avatar?: string;
  currentGoal?: string;
  goals?: Goal[];
  goalsCount: number;
  email?: string;
  age?: number;
  arabicProficiency?: boolean;
  arabicAccent?: string;
  tajweedLevel?: 'beginner' | 'intermediate' | 'advanced';
}
