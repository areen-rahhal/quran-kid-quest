export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  avatar?: string;
  currentGoal?: string;
  goalsCount: number;
  email?: string;
  age?: number;
  arabicProficiency?: boolean;
  arabicAccent?: string;
  tajweedLevel?: 'beginner' | 'intermediate' | 'advanced';
}
