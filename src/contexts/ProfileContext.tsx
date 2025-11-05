import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Profile } from '@/types/profile';

interface ProfileContextType {
  currentProfile: Profile;
  profiles: Profile[];
  switchProfile: (profileId: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Mock profiles data
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Aya',
    type: 'parent',
    goalsCount: 0,
  },
  {
    id: '2',
    name: 'Ahmad',
    type: 'child',
    currentGoal: "Juz' 30",
    goalsCount: 1,
  },
  {
    id: '3',
    name: 'Zain',
    type: 'child',
    currentGoal: "Juz' 30",
    goalsCount: 1,
  },
];

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles] = useState<Profile[]>(mockProfiles);
  const [currentProfile, setCurrentProfile] = useState<Profile>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('currentProfile');
    if (saved) {
      const savedProfile = JSON.parse(saved);
      return profiles.find(p => p.id === savedProfile.id) || profiles[0];
    }
    return profiles[0];
  });

  useEffect(() => {
    // Persist current profile to localStorage
    localStorage.setItem('currentProfile', JSON.stringify(currentProfile));
  }, [currentProfile]);

  const switchProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  return (
    <ProfileContext.Provider value={{ currentProfile, profiles, switchProfile }}>
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
