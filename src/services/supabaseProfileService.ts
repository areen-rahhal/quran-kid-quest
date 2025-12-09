import { supabase } from '@/lib/supabase';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { withSupabaseTimeout } from '@/lib/supabaseTimeout';
import type { DbProfileRow, DbGoalRow } from '@/types/database';
import { validateDbProfileRow, tryValidateDbProfileRow } from '@/types/database';
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

      const { data, error } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true }),
        'loadProfiles'
      );

      if (error) {
        console.error('[supabaseProfileService] Error loading profiles:', {
          message: error.message,
          code: error.code,
          status: error.status,
        });
        return [];
      }

      console.log('[supabaseProfileService] Loaded profiles:', data?.length);
      return (data || []).map(dbProfile => convertDbProfileToProfile(dbProfile));
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.error('[supabaseProfileService] Request timeout loading profiles:', error.message);
      } else {
        console.error('[supabaseProfileService] Exception loading profiles:', error);
      }
      return [];
    }
  },

  /**
   * Load all goals for a specific profile
   */
  async loadGoalsForProfile(profileId: string): Promise<any[]> {
    try {
      console.log('[supabaseProfileService] Loading goals for profile:', profileId);

      const { data, error } = await withSupabaseTimeout(
        supabase
          .from('goals')
          .select('*')
          .eq('profile_id', profileId),
        `loadGoalsForProfile(${profileId})`
      );

      if (error) {
        console.error('[supabaseProfileService] Error loading goals:', error);
        return [];
      }

      console.log('[supabaseProfileService] Loaded goals:', data?.length);
      return data || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('timed out')) {
        console.error('[supabaseProfileService] Request timeout loading goals for profile:', profileId);
      } else {
        console.error('[supabaseProfileService] Exception loading goals:', error);
      }
      return [];
    }
  },

  /**
   * Save a new profile to Supabase
   */
  async saveProfile(profile: Profile): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Saving profile:', profile.name);
      // Don't include id - let Supabase generate UUID automatically
      const { data, error } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .insert({
            name: profile.name,
            type: profile.type,
            parent_id: profile.parentId || null,
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
          .single(),
        'saveProfile'
      );

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

      console.log('[supabaseProfileService] Profile saved successfully with id:', data?.id);
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
      const { data, error } = await withSupabaseTimeout(
        supabase
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
          .single(),
        `updateProfile(${profileId})`
      );

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
      const { data: existingGoal } = await withSupabaseTimeout(
        supabase
          .from('goals')
          .select('id')
          .eq('profile_id', profileId)
          .eq('goal_id', goalId)
          .single(),
        `addGoalToProfile check existing(${profileId}, ${goalId})`
      );

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
      const { error } = await withSupabaseTimeout(
        supabase.from('goals').insert({
          profile_id: profileId,
          goal_id: goalId,
          name: goalName,
          status: 'in-progress',
          completed_surahs: 0,
          total_surahs: totalSurahs,
          phase_size: effectivePhaseSize,
          current_unit_id: goalConfig?.units?.[0]?.id?.toString(),
        }),
        `addGoalToProfile insert(${profileId}, ${goalId})`
      );

      if (error) {
        console.error('[supabaseProfileService] Error adding goal:', error);
        return false;
      }

      // Update profile's goals_count
      const { data: currentProfile } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('goals_count')
          .eq('id', profileId)
          .single(),
        `addGoalToProfile getProfile(${profileId})`
      );

      if (currentProfile) {
        await withSupabaseTimeout(
          supabase
            .from('profiles')
            .update({
              goals_count: (currentProfile.goals_count || 0) + 1,
              current_goal: goalName,
            })
            .eq('id', profileId),
          `addGoalToProfile updateProfile(${profileId})`
        );
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
      const { error } = await withSupabaseTimeout(
        supabase
          .from('goals')
          .delete()
          .eq('profile_id', profileId)
          .eq('goal_id', goalId),
        `deleteGoalFromProfile(${profileId}, ${goalId})`
      );

      if (error) {
        console.error('[supabaseProfileService] Error deleting goal:', error);
        return false;
      }

      // Update profile's goals_count
      const { data: currentProfile } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('goals_count')
          .eq('id', profileId)
          .single(),
        `deleteGoalFromProfile getProfile(${profileId})`
      );

      if (currentProfile) {
        const newCount = Math.max(0, (currentProfile.goals_count || 0) - 1);
        await withSupabaseTimeout(
          supabase
            .from('profiles')
            .update({
              goals_count: newCount,
              current_goal: newCount === 0 ? null : currentProfile.current_goal,
            })
            .eq('id', profileId),
          `deleteGoalFromProfile updateProfile(${profileId})`
        );
      }

      console.log('[supabaseProfileService] Goal deleted successfully');
      return true;
    } catch (error) {
      console.error('[supabaseProfileService] Exception deleting goal:', error);
      return false;
    }
  },

  /**
   * Load profiles for a specific parent (parent + their children)
   */
  async loadProfilesForParent(parentId: string): Promise<Profile[]> {
    try {
      console.log('[supabaseProfileService] Loading profiles for parent:', parentId);

      // Load parent profile
      const { data: parentData, error: parentError } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', parentId)
          .single(),
        `loadProfilesForParent getParent(${parentId})`
      );

      if (parentError || !parentData) {
        console.error('[supabaseProfileService] Error loading parent profile:', parentError);
        return [];
      }

      // Load children profiles
      const { data: childrenData, error: childrenError } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('parent_id', parentId)
          .order('created_at', { ascending: true }),
        `loadProfilesForParent getChildren(${parentId})`
      );

      if (childrenError) {
        console.error('[supabaseProfileService] Error loading children profiles:', childrenError);
      }

      const profiles: Profile[] = [convertDbProfileToProfile(parentData)];
      if (childrenData) {
        profiles.push(...childrenData.map(dbProfile => convertDbProfileToProfile(dbProfile)));
      }

      console.log('[supabaseProfileService] Loaded parent + children:', profiles.length);
      return profiles;
    } catch (error) {
      console.error('[supabaseProfileService] Exception loading profiles for parent:', error);
      return [];
    }
  },

  /**
   * Create a child profile under a parent
   */
  async createChildProfile(parentId: string, childData: Omit<Profile, 'id'>): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Creating child profile for parent:', parentId);

      // Validate parent exists
      const { data: parentProfile, error: parentError } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('id')
          .eq('id', parentId)
          .single(),
        `createChildProfile checkParent(${parentId})`
      );

      if (parentError || !parentProfile) {
        console.error('[supabaseProfileService] Parent profile not found:', parentId);
        return null;
      }

      // Check child count
      const { data: childrenCount, error: countError } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('parent_id', parentId),
        `createChildProfile countChildren(${parentId})`
      );

      if (!countError && childrenCount && childrenCount.length >= 3) {
        console.error('[supabaseProfileService] Parent already has 3 children');
        return null;
      }

      // Create child profile
      const { data, error } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .insert({
            name: childData.name,
            type: 'child',
            parent_id: parentId,
            avatar: childData.avatar,
            email: childData.email,
            age: childData.age,
            arabic_proficiency: childData.arabicProficiency,
            arabic_accent: childData.arabicAccent,
            tajweed_level: childData.tajweedLevel,
            current_goal: childData.currentGoal,
            goals_count: childData.goalsCount || 0,
            streak: childData.streak || 0,
            achievements: childData.achievements || {
              stars: 0,
              streak: 0,
              recitations: 0,
              goalsCompleted: 0,
            },
          })
          .select()
          .single(),
        `createChildProfile insert(${parentId})`
      );

      if (error) {
        console.error('[supabaseProfileService] Error creating child profile:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return null;
      }

      console.log('[supabaseProfileService] Child profile created successfully:', data?.id);
      return convertDbProfileToProfile(data);
    } catch (error) {
      console.error('[supabaseProfileService] Exception creating child profile:', error);
      return null;
    }
  },

  /**
   * Load a profile with its goals
   */
  async loadProfileWithGoals(profileId: string): Promise<Profile | null> {
    try {
      console.log('[supabaseProfileService] Loading profile with goals:', profileId);

      // Load profile
      const { data: profileData, error: profileError } = await withSupabaseTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single(),
        `loadProfileWithGoals getProfile(${profileId})`
      );

      if (profileError || !profileData) {
        console.error('[supabaseProfileService] Error loading profile:', profileError);
        return null;
      }

      // Load goals
      const { data: goalsData, error: goalsError } = await withSupabaseTimeout(
        supabase
          .from('goals')
          .select('*')
          .eq('profile_id', profileId),
        `loadProfileWithGoals getGoals(${profileId})`
      );

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

  /**
   * Load goals for multiple profiles and merge with existing profile data
   * Reuses profile data instead of re-fetching, significantly reducing database queries
   * Tier 2 Optimization: Eliminates redundant profile row fetches
   */
  async loadProfilesWithGoals(profiles: Profile[]): Promise<Profile[]> {
    try {
      if (profiles.length === 0) {
        return [];
      }

      console.log('[supabaseProfileService] Loading goals for profiles:', profiles.map(p => p.name).join(', '));

      // Fetch goals for all profiles in parallel
      const goalsPromises = profiles.map(profile =>
        this.loadGoalsForProfile(profile.id)
      );

      const allGoalsResults = await Promise.all(goalsPromises);

      // Merge goals into profiles
      const profilesWithGoals = profiles.map((profile, index) => {
        const goalsData = allGoalsResults[index] || [];
        const profileCopy = { ...profile };
        profileCopy.goals = goalsData.map(dbGoal => ({
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
        return profileCopy;
      });

      console.log('[supabaseProfileService] Loaded goals for all profiles');
      return profilesWithGoals;
    } catch (error) {
      console.error('[supabaseProfileService] Exception loading profiles with goals:', error);
      // Fallback: return profiles without goals instead of failing
      return profiles;
    }
  },
};

/**
 * Convert database profile row to Profile interface
 * Validates DB row shape at runtime for type safety
 */
function convertDbProfileToProfile(dbProfile: any): Profile {
  // Validate at runtime to catch schema mismatches
  const validated = tryValidateDbProfileRow(dbProfile);
  if (!validated) {
    console.warn('[supabaseProfileService] Invalid profile row from database, using fallback conversion:', dbProfile);
    // Fallback conversion for backwards compatibility
    return {
      id: dbProfile.id,
      name: dbProfile.name,
      type: dbProfile.type as 'parent' | 'child',
      parentId: dbProfile.parent_id,
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

  // Use validated row (type-safe)
  return {
    id: validated.id,
    name: validated.name,
    type: validated.type,
    parentId: validated.parent_id,
    avatar: validated.avatar,
    email: validated.email,
    age: validated.age,
    arabicProficiency: validated.arabic_proficiency,
    arabicAccent: validated.arabic_accent,
    tajweedLevel: validated.tajweed_level,
    currentGoal: validated.current_goal,
    goalsCount: validated.goals_count,
    streak: validated.streak,
    achievements: validated.achievements,
    goals: [],
  };
}
