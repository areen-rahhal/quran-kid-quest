import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { profileService } from '@/services/profileService';

/**
 * Clean profile object before storing in localStorage
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
      phases: null,
      currentUnitId: goal.currentUnitId,
      completionDate: goal.completionDate,
    })),
    achievements: profile.achievements,
  } as Profile;
}

interface ProfileContextType {
  currentProfile: Profile;
  profiles: Profile[];
  switchProfile: (profileId: string) => void;
  registerParent: (data: RegistrationData) => Profile;
  addGoal: (profileId: string, goalId: string, goalName: string, phaseSize?: number) => void;
  addGoalWithPhaseSize: (profileId: string, goalId: string, goalName: string, phaseSize: number) => void;
  updateGoalPhaseSize: (profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => void;
  updateProfile: (profileId: string, updates: ProfileUpdate) => void;
  deleteGoal: (profileId: string, goalId: string) => void;
  isRegistrationComplete: boolean;
  parentProfile: Profile | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Mock profiles data - CLEAN with no goals (start fresh)
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aya',
    type: 'parent',
    goalsCount: 0,
    email: 'aya@example.com',
    avatar: 'avatar-1',
    currentGoal: undefined,
    streak: 0,
    goals: [],
    achievements: {
      stars: 0,
      streak: 0,
      recitations: 0,
      goalsCompleted: 0,
    },
  },
  {
    id: '2',
    name: 'Waleed',
    type: 'child',
    avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fcc50a4fcacab42d49c80a89631bc6bec?format=webp&width=800',
    currentGoal: undefined,
    goalsCount: 0,
    streak: 0,
    goals: [],
    achievements: {
      stars: 0,
      streak: 0,
      recitations: 0,
      goalsCompleted: 0,
    },
  },
  {
    id: '3',
    name: 'Zain',
    type: 'child',
    avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa3cffb81fbde4015ad8bedfb2e19a16e?format=webp&width=800',
    currentGoal: undefined,
    goalsCount: 0,
    streak: 0,
    goals: [],
    achievements: {
      stars: 0,
      streak: 0,
      recitations: 0,
      goalsCompleted: 0,
    },
  },
];

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    // Try to load from localStorage first
    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      try {
        const parsed = JSON.parse(storedProfiles);
        // Validate it's a proper array with valid structure
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.id && parsed[0]?.name) {
          return parsed;
        }
      } catch (e) {
        // If parse fails, clear corrupted data and use fresh mock data
        localStorage.removeItem('profiles');
        localStorage.removeItem('currentProfile');
      }
    }
    // Fall back to fresh clean mock data
    return profileService.initializeProfiles(mockProfiles);
  });
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    // Try to load from localStorage first
    const storedCurrentProfile = localStorage.getItem('currentProfile');
    if (storedCurrentProfile) {
      try {
        const parsed = JSON.parse(storedCurrentProfile);
        if (parsed && parsed.id && parsed.name) {
          return parsed;
        }
      } catch (e) {
        // If parse fails, clear corrupted data
        localStorage.removeItem('currentProfile');
      }
    }
    // Fall back to first mock profile
    return mockProfiles[0] || ({} as Profile);
  });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(() => {
    return profileService.initializeRegistrationStatus();
  });
  const [parentProfile, setParentProfile] = useState<Profile | null>(() => {
    return profileService.initializeParentProfile();
  });

  // Debounced localStorage saves
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const cleanedProfiles = profiles.map(cleanProfileForStorage);
        localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
      } catch (error) {
        console.error('Failed to save profiles:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [profiles]);

  // Debounced currentProfile save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const cleanedProfile = cleanProfileForStorage(currentProfile);
        localStorage.setItem('currentProfile', JSON.stringify(cleanedProfile));
      } catch (error) {
        console.error('Failed to save currentProfile:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [currentProfile]);

  // Save registration status (small data, synchronous is okay)
  useEffect(() => {
    localStorage.setItem('isRegistrationComplete', String(isRegistrationComplete));
  }, [isRegistrationComplete]);

  // Debounced parentProfile save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (parentProfile) {
        try {
          const cleanedProfile = cleanProfileForStorage(parentProfile);
          localStorage.setItem('parentProfile', JSON.stringify(cleanedProfile));
        } catch (error) {
          console.error('Failed to save parentProfile:', error);
        }
      } else {
        localStorage.removeItem('parentProfile');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [parentProfile]);

  const switchProfile = (profileId: string) => {
    const profile = profileService.switchProfile(profiles, profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const registerParent = (data: RegistrationData): Profile => {
    const { profile, updatedProfiles } = profileService.registerParent(data, profiles);
    setProfiles(updatedProfiles);
    setCurrentProfile(profile);
    setParentProfile(profile);
    setIsRegistrationComplete(true);
    return profile;
  };

  const addGoal = (profileId: string, goalId: string, goalName: string, phaseSize?: number) => {
    // Get updated data from service
    const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
      profiles,
      profileId,
      goalId,
      goalName,
      phaseSize
    );
    // Update state - separate calls to avoid nested setState
    setProfiles(updatedProfiles);
    if (updatedCurrentProfile.id === profileId) {
      setCurrentProfile(updatedCurrentProfile);
    }
  };

  const addGoalWithPhaseSize = (profileId: string, goalId: string, goalName: string, phaseSize: number) => {
    addGoal(profileId, goalId, goalName, phaseSize);
  };

  const updateGoalPhaseSize = (profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => {
    const { updatedProfiles, updatedCurrentProfile } = profileService.updateGoalPhaseSize(
      profiles,
      profileId,
      goalId,
      newPhaseSize,
      unitId
    );
    setProfiles(updatedProfiles);
    if (updatedCurrentProfile.id === profileId) {
      setCurrentProfile(updatedCurrentProfile);
    }
  };

  const updateProfile = (profileId: string, updates: ProfileUpdate) => {
    const { updatedProfiles, updatedCurrentProfile } =
      profileService.updateProfile(profiles, profileId, updates);
    setProfiles(updatedProfiles);
    if (updatedCurrentProfile.id === profileId) {
      setCurrentProfile(updatedCurrentProfile);
    }
  };

  const deleteGoal = (profileId: string, goalId: string) => {
    const { updatedProfiles, updatedCurrentProfile } = profileService.deleteGoal(
      profiles,
      profileId,
      goalId
    );
    setProfiles(updatedProfiles);
    if (updatedCurrentProfile.id === profileId) {
      setCurrentProfile(updatedCurrentProfile);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        switchProfile,
        registerParent,
        addGoal,
        addGoalWithPhaseSize,
        updateGoalPhaseSize,
        updateProfile,
        deleteGoal,
        isRegistrationComplete,
        parentProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
