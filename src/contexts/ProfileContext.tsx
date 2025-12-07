import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { profileService } from '@/services/profileService';
import { phaseService } from '@/services/phaseService';
import { getGoalById } from '@/config/goals-data';

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

// Helper function to initialize a goal without storing phases in memory
function initializeGoalWithPhases(
  goalId: string,
  goalName: string,
  status: 'in-progress' | 'completed' | 'paused',
  completedSurahs: number,
  totalSurahs: number
) {
  const goalConfig = getGoalById(goalId);
  if (!goalConfig) return null;

  const phaseSize = goalConfig.metadata.defaultPhaseSize;
  let currentUnitId = undefined;

  if (goalConfig.units && goalConfig.units.length > 0) {
    currentUnitId = goalConfig.units[0].id.toString();
  }

  return {
    id: goalId,
    name: goalName,
    status,
    completedSurahs,
    totalSurahs,
    phaseSize,
    phases: null,
    currentUnitId,
  };
}

// Mock profiles data
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aya',
    type: 'parent',
    goalsCount: 2,
    email: 'aya@example.com',
    avatar: 'avatar-1',
    currentGoal: 'Surah Al-Bakarah',
    streak: 0,
    goals: [
      initializeGoalWithPhases('surah-bakarah', 'Surah Al-Bakarah', 'in-progress', 0, 1),
      initializeGoalWithPhases('surah-rahman', 'Surah Al-Rahman', 'in-progress', 0, 1),
    ].filter(Boolean) as any[],
    achievements: {
      stars: 128,
      streak: 0,
      recitations: 45,
      goalsCompleted: 0,
    },
  },
  {
    id: '2',
    name: 'Waleed',
    type: 'child',
    avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fcc50a4fcacab42d49c80a89631bc6bec?format=webp&width=800',
    currentGoal: "Juz' 29",
    goalsCount: 2,
    streak: 12,
    goals: [
      initializeGoalWithPhases('juz-29', "Juz' 29", 'in-progress', 4, 11),
      initializeGoalWithPhases('juz-30', "Juz' 30", 'completed', 37, 37),
    ].filter(Boolean) as any[],
    achievements: {
      stars: 42,
      streak: 12,
      recitations: 45,
      goalsCompleted: 1,
    },
  },
  {
    id: '3',
    name: 'Zain',
    type: 'child',
    avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa3cffb81fbde4015ad8bedfb2e19a16e?format=webp&width=800',
    currentGoal: "Juz' 30",
    goalsCount: 2,
    streak: 7,
    goals: [
      initializeGoalWithPhases('juz-30', "Juz' 30", 'in-progress', 3, 37),
      initializeGoalWithPhases('short-surahs', 'Short Surahs', 'in-progress', 0, 9),
    ].filter(Boolean) as any[],
    achievements: {
      stars: 3,
      streak: 7,
      recitations: 3,
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
        // Validate it's a proper array
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // If parse fails, fall back to mock data
      }
    }
    // Fall back to mock data if localStorage is empty or invalid
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

  // Non-blocking debounced localStorage saves using requestIdleCallback
  // This prevents blocking the main thread when serializing large objects
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let idleCallbackId: number;

    const scheduleProfilesSave = () => {
      // Use requestIdleCallback if available (modern browsers), fallback to setTimeout
      if ('requestIdleCallback' in window) {
        idleCallbackId = requestIdleCallback(
          () => {
            try {
              const cleanedProfiles = profiles.map(cleanProfileForStorage);
              localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
            } catch (error) {
              console.error('Failed to save profiles to localStorage:', error);
              // Clear old data to free up space if quota exceeded
              try {
                localStorage.removeItem('profiles');
                const cleanedProfiles = profiles.map(cleanProfileForStorage);
                localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
              } catch (e) {
                console.error('Still failed after clearing:', e);
              }
            }
          },
          { timeout: 1000 } // Ensure save happens within 1 second even if thread is busy
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        timeoutId = setTimeout(() => {
          try {
            const cleanedProfiles = profiles.map(cleanProfileForStorage);
            localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
          } catch (error) {
            console.error('Failed to save profiles to localStorage:', error);
            try {
              localStorage.removeItem('profiles');
              const cleanedProfiles = profiles.map(cleanProfileForStorage);
              localStorage.setItem('profiles', JSON.stringify(cleanedProfiles));
            } catch (e) {
              console.error('Still failed after clearing:', e);
            }
          }
        }, 300);
      }
    };

    // Debounce: wait 300ms before scheduling the save
    timeoutId = setTimeout(scheduleProfilesSave, 300);

    return () => {
      clearTimeout(timeoutId);
      if ('cancelIdleCallback' in window && idleCallbackId) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [profiles]);

  // Non-blocking debounced currentProfile save
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let idleCallbackId: number;

    const scheduleCurrentProfileSave = () => {
      if ('requestIdleCallback' in window) {
        idleCallbackId = requestIdleCallback(
          () => {
            try {
              const cleanedProfile = cleanProfileForStorage(currentProfile);
              localStorage.setItem('currentProfile', JSON.stringify(cleanedProfile));
            } catch (error) {
              console.error('Failed to save currentProfile to localStorage:', error);
              localStorage.removeItem('currentProfile');
            }
          },
          { timeout: 1000 }
        );
      } else {
        timeoutId = setTimeout(() => {
          try {
            const cleanedProfile = cleanProfileForStorage(currentProfile);
            localStorage.setItem('currentProfile', JSON.stringify(cleanedProfile));
          } catch (error) {
            console.error('Failed to save currentProfile to localStorage:', error);
            localStorage.removeItem('currentProfile');
          }
        }, 300);
      }
    };

    timeoutId = setTimeout(scheduleCurrentProfileSave, 300);

    return () => {
      clearTimeout(timeoutId);
      if ('cancelIdleCallback' in window && idleCallbackId) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [currentProfile]);

  // Save registration status (small data, synchronous is okay)
  useEffect(() => {
    localStorage.setItem('isRegistrationComplete', String(isRegistrationComplete));
  }, [isRegistrationComplete]);

  // Save parent profile using non-blocking approach
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let idleCallbackId: number;

    const scheduleParentProfileSave = () => {
      if ('requestIdleCallback' in window) {
        idleCallbackId = requestIdleCallback(
          () => {
            if (parentProfile) {
              try {
                const cleanedProfile = cleanProfileForStorage(parentProfile);
                localStorage.setItem('parentProfile', JSON.stringify(cleanedProfile));
              } catch (error) {
                console.error('Failed to save parentProfile:', error);
              }
            }
          },
          { timeout: 1000 }
        );
      } else {
        timeoutId = setTimeout(() => {
          if (parentProfile) {
            try {
              const cleanedProfile = cleanProfileForStorage(parentProfile);
              localStorage.setItem('parentProfile', JSON.stringify(cleanedProfile));
            } catch (error) {
              console.error('Failed to save parentProfile:', error);
            }
          }
        }, 300);
      }
    };

    if (parentProfile) {
      timeoutId = setTimeout(scheduleParentProfileSave, 300);
    } else {
      // If no parent profile, remove from storage
      localStorage.removeItem('parentProfile');
    }

    return () => {
      clearTimeout(timeoutId);
      if ('cancelIdleCallback' in window && idleCallbackId) {
        cancelIdleCallback(idleCallbackId);
      }
    };
  }, [parentProfile]);

  const switchProfile = (profileId: string) => {
    const profile = profileService.switchProfile(profiles, profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const registerParent = (data: RegistrationData): Profile => {
    // Compute once, use for both updates and return
    const { profile, updatedProfiles } = profileService.registerParent(data, profiles);

    // Update all related state
    setProfiles(updatedProfiles);
    setCurrentProfile(profile);
    setParentProfile(profile);
    setIsRegistrationComplete(true);

    return profile;
  };

  const addGoal = (profileId: string, goalId: string, goalName: string, phaseSize?: number) => {
    // Call service once to get both updates
    const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
      profiles,
      profileId,
      goalId,
      goalName,
      phaseSize
    );
    // Update state - React 18 will batch both updates together
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
