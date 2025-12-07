import {
  Profile,
  RegistrationData,
  ProfileUpdate,
  ProfileUpdateSchema,
} from '@/lib/validation';
import { storageService } from './storageService';
import { goalService } from './goalService';

/**
 * Ensure profile object is serializable and clean
 */
function cleanProfileForStorage(profile: Profile): Profile {
  return {
    id: profile.id,
    name: profile.name,
    type: profile.type,
    avatar: profile.avatar,
    email: profile.email,
    age: profile.age,
    currentGoal: profile.currentGoal,
    goalsCount: profile.goalsCount,
    streak: profile.streak,
    goals: (profile.goals || []).map(goal => ({
      id: goal.id,
      name: goal.name,
      status: goal.status,
      completedSurahs: goal.completedSurahs,
      totalSurahs: goal.totalSurahs,
      phaseSize: goal.phaseSize,
      phases: null, // Always null - don't store phases
      currentUnitId: goal.currentUnitId,
      completionDate: goal.completionDate,
    })),
    achievements: profile.achievements,
  } as Profile;
}

export const profileService = {
  /**
   * Initialize profiles from storage or fallback to defaults
   */
  initializeProfiles(mockProfiles: Profile[]): Profile[] {
    return storageService.loadProfiles(mockProfiles);
  },

  /**
   * Initialize current profile from storage
   */
  initializeCurrentProfile(allProfiles: Profile[]): Profile {
    return (
      storageService.loadCurrentProfile(allProfiles) ||
      allProfiles[0] ||
      ({} as Profile)
    );
  },

  /**
   * Initialize registration status
   */
  initializeRegistrationStatus(): boolean {
    return storageService.loadRegistrationStatus();
  },

  /**
   * Initialize parent profile from storage
   */
  initializeParentProfile(): Profile | null {
    return storageService.loadParentProfile();
  },

  /**
   * Register a new parent profile
   * Note: Storage persistence is handled by the ProfileContext provider
   */
  registerParent(
    data: RegistrationData,
    allProfiles: Profile[]
  ): { profile: Profile; updatedProfiles: Profile[] } {
    const newParentProfile: Profile = {
      id: Date.now().toString(),
      name: data.parentName,
      type: 'parent',
      email: data.email,
      avatar: data.avatar,
      goalsCount: 0,
      goals: [],
    };

    const updatedProfiles = [...allProfiles, newParentProfile];

    return {
      profile: newParentProfile,
      updatedProfiles,
    };
  },

  /**
   * Switch to a different profile
   */
  switchProfile(profiles: Profile[], profileId: string): Profile | null {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return null;

    storageService.saveCurrentProfile(profile);
    return profile;
  },

  /**
   * Add a goal to a profile
   * Note: Storage persistence is handled by the ProfileContext provider
   * @param phaseSize - Optional custom phase size (defaults to goal's defaultPhaseSize)
   */
  addGoal(
    profiles: Profile[],
    currentProfileId: string,
    goalId: string,
    goalName: string,
    phaseSize?: number
  ): { updatedProfiles: Profile[]; updatedCurrentProfile: Profile } {
    const updatedProfiles = profiles.map((profile) => {
      if (profile.id === currentProfileId) {
        return goalService.addGoalToProfile(profile, goalId, goalName, phaseSize);
      }
      return profile;
    });

    const updatedCurrentProfile =
      updatedProfiles.find((p) => p.id === currentProfileId) || updatedProfiles[0];

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Delete a goal from a profile
   * Note: Storage persistence is handled by the ProfileContext provider
   */
  deleteGoal(
    profiles: Profile[],
    profileId: string,
    goalId: string
  ): { updatedProfiles: Profile[]; updatedCurrentProfile: Profile } {
    const updatedProfiles = profiles.map((profile) => {
      if (profile.id === profileId) {
        return goalService.removeGoalFromProfile(profile, goalId);
      }
      return profile;
    });

    const updatedCurrentProfile =
      updatedProfiles.find((p) => p.id === profileId) || updatedProfiles[0];

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Update profile details
   * Note: Storage persistence is handled by the ProfileContext provider
   */
  updateProfile(
    profiles: Profile[],
    profileId: string,
    updates: ProfileUpdate
  ): { updatedProfiles: Profile[]; updatedCurrentProfile: Profile } {
    // Validate updates
    const validatedUpdates = ProfileUpdateSchema.parse(updates);

    const updatedProfiles = profiles.map((profile) => {
      if (profile.id === profileId) {
        return {
          ...profile,
          ...validatedUpdates,
        };
      }
      return profile;
    });

    const updatedCurrentProfile =
      updatedProfiles.find((p) => p.id === profileId) || updatedProfiles[0];

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Get profile by ID
   */
  getProfileById(profiles: Profile[], profileId: string): Profile | undefined {
    return profiles.find((p) => p.id === profileId);
  },

  /**
   * Check if profile exists
   */
  profileExists(profiles: Profile[], profileId: string): boolean {
    return profiles.some((p) => p.id === profileId);
  },

  /**
   * Update phase size for a goal in a profile
   * Note: Storage persistence is handled by the ProfileContext provider
   */
  updateGoalPhaseSize(
    profiles: Profile[],
    profileId: string,
    goalId: string,
    newPhaseSize: number,
    unitId?: number
  ): { updatedProfiles: Profile[]; updatedCurrentProfile: Profile } {
    const updatedProfiles = profiles.map((profile) => {
      if (profile.id === profileId) {
        return goalService.updateGoalPhaseSize(profile, goalId, newPhaseSize, unitId);
      }
      return profile;
    });

    const updatedCurrentProfile =
      updatedProfiles.find((p) => p.id === profileId) || updatedProfiles[0];

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Clear all stored data
   */
  clearAll(): void {
    storageService.clearAll();
  },
};
