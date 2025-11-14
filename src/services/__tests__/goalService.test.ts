import { describe, it, expect, beforeEach } from 'vitest';
import { goalService } from '../goalService';
import { Profile, GoalProgress } from '@/lib/validation';

const mockProfile: Profile = {
  id: '1',
  name: 'Test User',
  type: 'child',
  goalsCount: 0,
};

const mockGoalProgress: GoalProgress = {
  id: 'juz-29',
  name: "Juz' 29",
  status: 'in-progress',
  completedSurahs: 4,
  totalSurahs: 11,
};

describe('goalService', () => {
  describe('addGoalToProfile', () => {
    it('should add a goal to a profile with no goals', () => {
      const result = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      
      expect(result.goals).toBeDefined();
      expect(result.goals?.length).toBe(1);
      expect(result.goalsCount).toBe(1);
      expect(result.currentGoal).toBe('Surah Al-Fatiha');
      expect(result.goals?.[0]?.id).toBe('surah-fatiha');
    });

    it('should add multiple goals', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.addGoalToProfile(profile, 'surah-bakarah', 'Surah Al-Bakarah');
      
      expect(profile.goals?.length).toBe(2);
      expect(profile.goalsCount).toBe(2);
      expect(profile.currentGoal).toBe('Surah Al-Bakarah');
    });

    it('should set correct totals from goal config', () => {
      const result = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      expect(result.goals?.[0]?.totalSurahs).toBeGreaterThan(0);
      expect(result.goals?.[0]?.completedSurahs).toBe(0);
      expect(result.goals?.[0]?.status).toBe('in-progress');
    });

    it('should throw error for non-existent goal', () => {
      expect(() => {
        goalService.addGoalToProfile(mockProfile, 'non-existent-goal', 'Non Existent');
      }).toThrow();
    });
  });

  describe('removeGoalFromProfile', () => {
    it('should remove a goal from profile', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.removeGoalFromProfile(profile, 'surah-fatiha');
      
      expect(profile.goals?.length).toBe(0);
      expect(profile.goalsCount).toBe(0);
      expect(profile.currentGoal).toBeUndefined();
    });

    it('should maintain other goals when removing one', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.addGoalToProfile(profile, 'surah-bakarah', 'Surah Al-Bakarah');
      
      profile = goalService.removeGoalFromProfile(profile, 'surah-fatiha');
      
      expect(profile.goals?.length).toBe(1);
      expect(profile.goals?.[0]?.id).toBe('surah-bakarah');
      expect(profile.currentGoal).toBe('Surah Al-Bakarah');
    });

    it('should handle removing non-existent goal', () => {
      const profile = goalService.removeGoalFromProfile(mockProfile, 'non-existent');
      expect(profile.goals?.length).toBe(0);
    });
  });

  describe('updateGoalProgress', () => {
    it('should update goal progress', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.updateGoalProgress(profile, 'surah-fatiha', {
        completedSurahs: 5,
      });
      
      const goal = profile.goals?.[0];
      expect(goal?.completedSurahs).toBe(5);
    });

    it('should update goal status', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.updateGoalProgress(profile, 'surah-fatiha', {
        status: 'completed',
      });
      
      const goal = profile.goals?.[0];
      expect(goal?.status).toBe('completed');
    });

    it('should not affect other goals when updating one', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.addGoalToProfile(profile, 'surah-bakarah', 'Surah Al-Bakarah');
      
      profile = goalService.updateGoalProgress(profile, 'surah-fatiha', {
        completedSurahs: 5,
      });
      
      expect(profile.goals?.[0]?.completedSurahs).toBe(5);
      expect(profile.goals?.[1]?.completedSurahs).toBeUndefined();
    });
  });

  describe('getGoalFromProfile', () => {
    it('should retrieve a goal from profile', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      const goal = goalService.getGoalFromProfile(profile, 'surah-fatiha');

      expect(goal).toBeDefined();
      expect(goal?.id).toBe('surah-fatiha');
    });

    it('should return undefined for non-existent goal', () => {
      const goal = goalService.getGoalFromProfile(mockProfile, 'non-existent');
      expect(goal).toBeUndefined();
    });
  });

  describe('hasGoal', () => {
    it('should return true if profile has goal', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      const hasGoal = goalService.hasGoal(profile, 'surah-fatiha');
      
      expect(hasGoal).toBe(true);
    });

    it('should return false if profile does not have goal', () => {
      const hasGoal = goalService.hasGoal(mockProfile, 'surah-fatiha');
      expect(hasGoal).toBe(false);
    });
  });

  describe('completeGoal', () => {
    it('should mark goal as completed', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.completeGoal(profile, 'surah-fatiha');
      
      const goal = profile.goals?.[0];
      expect(goal?.status).toBe('completed');
    });
  });

  describe('pauseGoal', () => {
    it('should pause a goal', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.pauseGoal(profile, 'surah-fatiha');
      
      const goal = profile.goals?.[0];
      expect(goal?.status).toBe('paused');
    });
  });

  describe('resumeGoal', () => {
    it('should resume a paused goal', () => {
      let profile = goalService.addGoalToProfile(mockProfile, 'surah-fatiha', 'Surah Al-Fatiha');
      profile = goalService.pauseGoal(profile, 'surah-fatiha');
      profile = goalService.resumeGoal(profile, 'surah-fatiha');
      
      const goal = profile.goals?.[0];
      expect(goal?.status).toBe('in-progress');
    });
  });
});
