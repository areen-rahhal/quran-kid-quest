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
    // CLEAR OLD CORRUPTED DATA ON FRESH START
    // This ensures we start with clean mock profiles
    localStorage.removeItem('profiles');
    localStorage.removeItem('currentProfile');
    localStorage.removeItem('parentProfile');

    // Use fresh clean mock data
    return profileService.initializeProfiles(mockProfiles);
  });
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    // Try to load from localStorage first
    const storedCurrentProfile = localStorage.getItem('currentProfile');
    if (storedCurrentProfile) {
      try {
        const parsed = JSON.parse(storedCurrentProfile);
        if (parsed && parsed.id) {
          return parsed;
        }
      } catch (e) {
        // If parse fails, fall back to initialization
      }
    }
    // Fall back to initialization if localStorage is empty or invalid
    const initialProfiles = localStorage.getItem('profiles')
      ? JSON.parse(localStorage.getItem('profiles') || '[]')
      : profileService.initializeProfiles(mockProfiles);
    return profileService.initializeCurrentProfile(initialProfiles);
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
    // Use functional setState to avoid stale closures
    setProfiles((prevProfiles) => {
      const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
        prevProfiles,
        profileId,
        goalId,
        goalName,
        phaseSize
      );
      // Update currentProfile if it's the edited profile
      if (updatedCurrentProfile.id === profileId) {
        setCurrentProfile(updatedCurrentProfile);
      }
      return updatedProfiles;
    });
  };

  const addGoalWithPhaseSize = (profileId: string, goalId: string, goalName: string, phaseSize: number) => {
    addGoal(profileId, goalId, goalName, phaseSize);
  };

  const updateGoalPhaseSize = (profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles, updatedCurrentProfile } = profileService.updateGoalPhaseSize(
        prevProfiles,
        profileId,
        goalId,
        newPhaseSize,
        unitId
      );
      if (updatedCurrentProfile.id === profileId) {
        setCurrentProfile(updatedCurrentProfile);
      }
      return updatedProfiles;
    });
  };

  const updateProfile = (profileId: string, updates: ProfileUpdate) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles, updatedCurrentProfile } =
        profileService.updateProfile(prevProfiles, profileId, updates);
      if (updatedCurrentProfile.id === profileId) {
        setCurrentProfile(updatedCurrentProfile);
      }
      return updatedProfiles;
    });
  };

  const deleteGoal = (profileId: string, goalId: string) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles, updatedCurrentProfile } = profileService.deleteGoal(
        prevProfiles,
        profileId,
        goalId
      );
      if (updatedCurrentProfile.id === profileId) {
        setCurrentProfile(updatedCurrentProfile);
      }
      return updatedProfiles;
    });
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
