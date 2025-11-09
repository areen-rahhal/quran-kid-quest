import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '@/types/profile';

interface RegistrationData {
  email: string;
  password: string;
  parentName: string;
  avatar: string;
}

interface ProfileContextType {
  currentProfile: Profile;
  profiles: Profile[];
  switchProfile: (profileId: string) => void;
  registerParent: (data: RegistrationData) => Profile;
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
        id: 'goal-1',
        name: "Juz' 29",
        status: 'in-progress',
        completedSurahs: 4,
        totalSurahs: 11,
      },
      {
        id: 'goal-2',
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
        id: 'goal-3',
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
  const [profiles, setProfiles] = useState<Profile[]>(mockProfiles);
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem('currentProfile');
    if (saved) {
      const savedProfile = JSON.parse(saved);
      return profiles.find(p => p.id === savedProfile.id) || profiles[0];
    }
    return profiles[0];
  });
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(() => {
    return localStorage.getItem('isRegistrationComplete') === 'true';
  });
  const [parentProfile, setParentProfile] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('parentProfile');
    return saved ? JSON.parse(saved) : null;
  });

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
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const registerParent = (data: RegistrationData): Profile => {
    const newParentProfile: Profile = {
      id: Date.now().toString(),
      name: data.parentName,
      type: 'parent',
      email: data.email,
      avatar: data.avatar,
      goalsCount: 0,
    };

    const updatedProfiles = [...profiles, newParentProfile];
    setProfiles(updatedProfiles);
    setCurrentProfile(newParentProfile);
    setParentProfile(newParentProfile);
    setIsRegistrationComplete(true);

    return newParentProfile;
  };

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        switchProfile,
        registerParent,
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
