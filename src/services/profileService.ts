import {
  Profile,
  RegistrationData,
  ProfileUpdate,
  ProfileUpdateSchema,
} from '@/lib/validation';
import { storageService } from './storageService';
import { goalService } from './goalService';

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
    };

    const updatedProfiles = [...allProfiles, newParentProfile];

    // Persist to storage
    storageService.saveProfiles(updatedProfiles);
    storageService.saveCurrentProfile(newParentProfile);
    storageService.saveRegistrationStatus(true);
    storageService.saveParentProfile(newParentProfile);

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

    // Persist to storage
    storageService.saveProfiles(updatedProfiles);
    if (updatedCurrentProfile) {
      storageService.saveCurrentProfile(updatedCurrentProfile);
    }

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Delete a goal from a profile
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

    // Persist to storage
    storageService.saveProfiles(updatedProfiles);
    if (updatedCurrentProfile) {
      storageService.saveCurrentProfile(updatedCurrentProfile);
    }

    return {
      updatedProfiles,
      updatedCurrentProfile: updatedCurrentProfile || ({} as Profile),
    };
  },

  /**
   * Update profile details
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

    // Persist to storage
    storageService.saveProfiles(updatedProfiles);
    if (updatedCurrentProfile) {
      storageService.saveCurrentProfile(updatedCurrentProfile);
    }

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
   * Clear all stored data
   */
  clearAll(): void {
    storageService.clearAll();
  },
};
