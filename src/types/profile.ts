export interface Profile {
  id: string;
  name: string;
  type: 'parent' | 'child';
  avatar?: string;
  currentGoal?: string;
  goalsCount: number;
}
