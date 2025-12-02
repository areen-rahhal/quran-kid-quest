import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { profileService } from '@/services/profileService';

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

// Mock profiles data
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aya',
    type: 'parent',
    goalsCount: 0,
    email: 'aya@example.com',
    avatar: 'avatar-1',
    streak: 0,
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
      {
        id: 'juz-29',
        name: "Juz' 29",
        status: 'in-progress',
        completedSurahs: 4,
        totalSurahs: 11,
      },
      {
        id: 'juz-30',
        name: "Juz' 30",
        status: 'completed',
        completedSurahs: 37,
        totalSurahs: 37,
      },
    ],
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
    goalsCount: 1,
    streak: 7,
    goals: [
      {
        id: 'juz-30',
        name: "Juz' 30",
        status: 'in-progress',
        completedSurahs: 3,
        totalSurahs: 37,
      },
    ],
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
    return profileService.initializeProfiles(mockProfiles);
  });
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    return profileService.initializeCurrentProfile(
      profileService.initializeProfiles(mockProfiles)
    );
  });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(() => {
    return profileService.initializeRegistrationStatus();
  });
  const [parentProfile, setParentProfile] = useState<Profile | null>(() => {
    return profileService.initializeParentProfile();
  });

  useEffect(() => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('currentProfile', JSON.stringify(currentProfile));
  }, [currentProfile]);

  useEffect(() => {
    localStorage.setItem('isRegistrationComplete', String(isRegistrationComplete));
  }, [isRegistrationComplete]);

  useEffect(() => {
    if (parentProfile) {
      localStorage.setItem('parentProfile', JSON.stringify(parentProfile));
    }
  }, [parentProfile]);

  const switchProfile = (profileId: string) => {
    const profile = profileService.switchProfile(profiles, profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const registerParent = (data: RegistrationData): Profile => {
    const { profile, updatedProfiles } = profileService.registerParent(
      data,
      profiles
    );
    setProfiles(updatedProfiles);
    setCurrentProfile(profile);
    setParentProfile(profile);
    setIsRegistrationComplete(true);
    return profile;
  };

  const addGoal = (profileId: string, goalId: string, goalName: string) => {
    const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
      profiles,
      profileId,
      goalId,
      goalName
    );
    setProfiles(updatedProfiles);
    if (currentProfile.id === profileId) {
      setCurrentProfile(updatedCurrentProfile);
    }
  };

  const updateProfile = (profileId: string, updates: ProfileUpdate) => {
    const { updatedProfiles, updatedCurrentProfile } =
      profileService.updateProfile(profiles, profileId, updates);
    setProfiles(updatedProfiles);
    if (currentProfile.id === profileId) {
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
    if (currentProfile.id === profileId) {
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
