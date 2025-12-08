import { supabase } from '@/lib/supabase';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { goalService } from './goalService';

/**
 * Supabase Profile Service
 * Handles all database operations for profiles and goals
 */
export const supabaseProfileService = {
  /**
   * Load all profiles from Supabase
   */
  async loadProfiles(): Promise<Profile[]> {
    try {
      console.log('[supabaseProfileService] Loading profiles from Supabase');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[supabaseProfileService] Error loading profiles:', error);
        return [];
      }

      console.log('[supabaseProfileService] Loaded profiles:', data?.length);
      return (data || []).map(dbProfile => convertDbProfileToProfile(dbProfile));
    } catch (error) {
      console.error('[supabaseProfileService] Exception loading profiles:', error);
      return [];
    }
  },

  /**
   * Load all goals for a specific profile
   */
  async loadGoalsForProfile(profileId: string): Promise<any[]> {
    try {
      console.log('[supabaseProfileService] Loading goals for profile:', profileId);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('profile_id', profileId);

      if (error) {
        console.error('[supabaseProfileService] Error loading goals:', error);
        return [];
      }

      console.log('[supabaseProfileService] Loaded goals:', data?.length);
      return data || [];
    } catch (error) {
      console.error('[supabaseProfileService] Exception loading goals:', error);
      return [];
    }
  },

  /**
   * Save a new profile to Supabase
   */
  async saveProfile(profile: Profile): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Saving profile:', profile.name, 'id:', profile.id);
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: profile.id,
          name: profile.name,
          type: profile.type,
          avatar: profile.avatar,
          email: profile.email,
          age: profile.age,
          arabic_proficiency: profile.arabicProficiency,
          arabic_accent: profile.arabicAccent,
          tajweed_level: profile.tajweedLevel,
          current_goal: profile.currentGoal,
          goals_count: profile.goalsCount || 0,
          streak: profile.streak || 0,
          achievements: profile.achievements || {
            stars: 0,
            streak: 0,
            recitations: 0,
            goalsCompleted: 0,
          },
        })
        .select()
        .single();

      if (error) {
        console.error('[supabaseProfileService] Error saving profile:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status: error.status,
        });
        return null;
      }

      console.log('[supabaseProfileService] Profile saved successfully');
      return convertDbProfileToProfile(data);
    } catch (error) {
      console.error('[supabaseProfileService] Exception saving profile:', error instanceof Error ? error.message : String(error));
      return null;
    }
  },

  /**
   * Update a profile in Supabase
   */
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Updating profile:', profileId);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          avatar: updates.avatar,
          age: updates.age,
          current_goal: updates.currentGoal,
          goals_count: updates.goalsCount,
          streak: updates.streak,
          achievements: updates.achievements,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select()
        .single();

      if (error) {
        console.error('[supabaseProfileService] Error updating profile:', error);
        return null;
      }

      console.log('[supabaseProfileService] Profile updated successfully');
      return convertDbProfileToProfile(data);
    } catch (error) {
      console.error('[supabaseProfileService] Exception updating profile:', error);
      return null;
    }
  },

  /**
   * Add a goal to a profile
   */
  async addGoalToProfile(
    profileId: string,
    goalId: string,
    goalName: string,
    phaseSize?: number
  ): Promise<boolean> {
    try {
      console.log('[supabaseProfileService] Adding goal to profile:', {
        profileId,
        goalId,
        goalName,
      });

      // Check if goal already exists
      const { data: existingGoal } = await supabase
        .from('goals')
        .select('id')
        .eq('profile_id', profileId)
        .eq('goal_id', goalId)
        .single();

      if (existingGoal) {
        console.log('[supabaseProfileService] Goal already exists, skipping');
        return true;
      }

      // Get goal config to determine totalSurahs
      const { getGoalById } = await import('@/config/goals-data');
      const goalConfig = getGoalById(goalId);
      const totalSurahs = goalConfig?.metadata?.surahCount || 0;
      const effectivePhaseSize = phaseSize || goalConfig?.metadata?.defaultPhaseSize || 5;

      // Insert goal
      const { error } = await supabase.from('goals').insert({
        profile_id: profileId,
        goal_id: goalId,
        name: goalName,
        status: 'in-progress',
        completed_surahs: 0,
        total_surahs: totalSurahs,
        phase_size: effectivePhaseSize,
        current_unit_id: goalConfig?.units?.[0]?.id?.toString(),
      });

      if (error) {
        console.error('[supabaseProfileService] Error adding goal:', error);
        return false;
      }

      // Update profile's goals_count
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('goals_count')
        .eq('id', profileId)
        .single();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            goals_count: (currentProfile.goals_count || 0) + 1,
            current_goal: goalName,
          })
          .eq('id', profileId);
      }

      console.log('[supabaseProfileService] Goal added successfully');
      return true;
    } catch (error) {
      console.error('[supabaseProfileService] Exception adding goal:', error);
      return false;
    }
  },

  /**
   * Delete a goal from a profile
   */
  async deleteGoalFromProfile(profileId: string, goalId: string): Promise<boolean> {
    try {
      console.log('[supabaseProfileService] Deleting goal:', goalId);

      // Delete goal
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('profile_id', profileId)
        .eq('goal_id', goalId);

      if (error) {
        console.error('[supabaseProfileService] Error deleting goal:', error);
        return false;
      }

      // Update profile's goals_count
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('goals_count')
        .eq('id', profileId)
        .single();

      if (currentProfile) {
        const newCount = Math.max(0, (currentProfile.goals_count || 0) - 1);
        await supabase
          .from('profiles')
          .update({
            goals_count: newCount,
            current_goal: newCount === 0 ? null : currentProfile.current_goal,
          })
          .eq('id', profileId);
      }

      console.log('[supabaseProfileService] Goal deleted successfully');
      return true;
    } catch (error) {
      console.error('[supabaseProfileService] Exception deleting goal:', error);
      return false;
    }
  },

  /**
   * Load a profile with its goals
   */
  async loadProfileWithGoals(profileId: string): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Loading profile with goals:', profileId);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError || !profileData) {
        console.error('[supabaseProfileService] Error loading profile:', profileError);
        return null;
      }

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('profile_id', profileId);

      if (goalsError) {
        console.error('[supabaseProfileService] Error loading goals:', goalsError);
      }

      const profile = convertDbProfileToProfile(profileData);
      profile.goals = (goalsData || []).map(dbGoal => ({
        id: dbGoal.goal_id,
        name: dbGoal.name,
        status: dbGoal.status,
        completedSurahs: dbGoal.completed_surahs,
        totalSurahs: dbGoal.total_surahs,
        phaseSize: dbGoal.phase_size,
        phases: null,
        currentUnitId: dbGoal.current_unit_id,
        completionDate: dbGoal.completion_date,
      }));

      console.log('[supabaseProfileService] Loaded profile with goals:', profile.goals?.length);
      return profile;
    } catch (error) {
      console.error('[supabaseProfileService] Exception loading profile with goals:', error);
      return null;
    }
  },
};

/**
 * Convert database profile row to Profile interface
 */
function convertDbProfileToProfile(dbProfile: any): Profile {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    type: dbProfile.type as 'parent' | 'child',
    avatar: dbProfile.avatar,
    email: dbProfile.email,
    age: dbProfile.age,
    arabicProficiency: dbProfile.arabic_proficiency,
    arabicAccent: dbProfile.arabic_accent,
    tajweedLevel: dbProfile.tajweed_level as 'beginner' | 'intermediate' | 'advanced' | undefined,
    currentGoal: dbProfile.current_goal,
    goalsCount: dbProfile.goals_count || 0,
    streak: dbProfile.streak || 0,
    achievements: dbProfile.achievements || {
      stars: 0,
      streak: 0,
      recitations: 0,
      goalsCompleted: 0,
    },
    goals: [],
  };
}
