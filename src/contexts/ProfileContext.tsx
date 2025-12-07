import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
    avatar: 'avatar-deer',
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
    // CLEAR ALL OLD DATA - Fresh start
    localStorage.removeItem('profiles');
    localStorage.removeItem('currentProfile');
    localStorage.removeItem('parentProfile');
    localStorage.removeItem('isRegistrationComplete');

    // Always start with fresh clean mock data (no goals)
    return profileService.initializeProfiles(mockProfiles);
  });
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    // Always start with first profile from fresh mock data
    return mockProfiles[0] || ({} as Profile);
  });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(() => {
    return profileService.initializeRegistrationStatus();
  });
  const [parentProfile, setParentProfile] = useState<Profile | null>(() => {
    return profileService.initializeParentProfile();
  });

  // Keep currentProfile in sync when profiles change
  useEffect(() => {
    console.log('[SYNC EFFECT] profiles changed, current profiles count:', profiles.length);
    console.log('[SYNC EFFECT] looking for profile with id:', currentProfile.id);
    const updatedProfile = profiles.find(p => p.id === currentProfile.id);
    console.log('[SYNC EFFECT] found updated profile:', updatedProfile?.name, 'goals:', updatedProfile?.goals?.length);
    if (updatedProfile && updatedProfile !== currentProfile) {
      console.log('[SYNC EFFECT] calling setCurrentProfile');
      setCurrentProfile(updatedProfile);
      console.log('[SYNC EFFECT] setCurrentProfile done');
    }
  }, [profiles]);

  // Debounced localStorage saves
  useEffect(() => {
    console.log('[STORAGE EFFECT] profiles changed, scheduling save in 300ms');
    const timer = setTimeout(() => {
      console.log('[STORAGE EFFECT] saving profiles to localStorage');
      try {
        const cleanedProfiles = profiles.map(cleanProfileForStorage);
        console.log('[STORAGE EFFECT] cleaned profiles count:', cleanedProfiles.length);
        localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
        console.log('[STORAGE EFFECT] save complete');
      } catch (error) {
        console.error('[STORAGE EFFECT] Failed to save profiles:', error);
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

  const addGoal = useCallback((profileId: string, goalId: string, goalName: string, phaseSize?: number) => {
    console.log('[addGoal] called with:', { profileId, goalId, goalName });
    try {
      setProfiles((prevProfiles) => {
        console.log('[addGoal] setProfiles callback - prevProfiles count:', prevProfiles.length);
        const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
          prevProfiles,
          profileId,
          goalId,
          goalName,
          phaseSize
        );
        console.log('[addGoal] service returned updatedProfiles count:', updatedProfiles.length);
        console.log('[addGoal] updatedCurrentProfile:', updatedCurrentProfile.name, 'goals:', updatedCurrentProfile.goals?.length);
        // Don't call setState here - let the useEffect handle currentProfile sync
        return updatedProfiles;
      });
      console.log('[addGoal] setProfiles call completed');
    } catch (error) {
      console.error('[addGoal] ERROR:', error);
      throw error;
    }
  }, []);

  const addGoalWithPhaseSize = (profileId: string, goalId: string, goalName: string, phaseSize: number) => {
    addGoal(profileId, goalId, goalName, phaseSize);
  };

  const updateGoalPhaseSize = useCallback((profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles } = profileService.updateGoalPhaseSize(
        prevProfiles,
        profileId,
        goalId,
        newPhaseSize,
        unitId
      );
      return updatedProfiles;
    });
  }, []);

  const updateProfile = useCallback((profileId: string, updates: ProfileUpdate) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles } = profileService.updateProfile(prevProfiles, profileId, updates);
      return updatedProfiles;
    });
  }, []);

  const deleteGoal = useCallback((profileId: string, goalId: string) => {
    setProfiles((prevProfiles) => {
      const { updatedProfiles } = profileService.deleteGoal(
        prevProfiles,
        profileId,
        goalId
      );
      return updatedProfiles;
    });
  }, []);

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
