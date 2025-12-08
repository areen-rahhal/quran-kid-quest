import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { profileService } from '@/services/profileService';
import { supabaseProfileService } from '@/services/supabaseProfileService';

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
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Default empty profile
const defaultEmptyProfile: Profile = {
  id: 'unknown',
  name: 'Unknown',
  type: 'child',
  goals: [],
  goalsCount: 0,
  achievements: {
    stars: 0,
    streak: 0,
    recitations: 0,
    goalsCompleted: 0,
  },
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile>(defaultEmptyProfile);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);
  const [parentProfile, setParentProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize profiles from Supabase
  useEffect(() => {
    const initializeProfiles = async () => {
      try {
        console.log('[ProfileProvider] Initializing profiles from Supabase');
        setIsLoading(true);

        // Load all profiles
        const loadedProfiles = await supabaseProfileService.loadProfiles();
        console.log('[ProfileProvider] Loaded profiles:', loadedProfiles.length);

        if (loadedProfiles.length === 0) {
          console.log('[ProfileProvider] No profiles in Supabase, creating defaults');
          // Create default profiles if none exist
          const defaultProfiles = await createDefaultProfiles();
          setProfiles(defaultProfiles);
          if (defaultProfiles.length > 0) {
            setCurrentProfile(defaultProfiles[0]);
          }
        } else {
          // Load each profile with its goals
          const profilesWithGoals = await Promise.all(
            loadedProfiles.map(profile => supabaseProfileService.loadProfileWithGoals(profile.id))
          );
          const validProfiles = profilesWithGoals.filter(p => p !== null) as Profile[];
          setProfiles(validProfiles);
          if (validProfiles.length > 0) {
            setCurrentProfile(validProfiles[0]);
          }
        }

        // Load registration status
        const regStatus = localStorage.getItem('isRegistrationComplete') === 'true';
        setIsRegistrationComplete(regStatus);

        // Load parent profile from localStorage temporarily (can migrate later)
        const parentData = localStorage.getItem('parentProfile');
        if (parentData) {
          try {
            setParentProfile(JSON.parse(parentData));
          } catch (e) {
            console.error('Failed to parse parent profile', e);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('[ProfileProvider] Error initializing profiles:', error);
        setIsLoading(false);
      }
    };

    initializeProfiles();
  }, []);

  const switchProfile = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      console.log('[switchProfile] Switching to profile:', profile.name);
      setCurrentProfile(profile);
    }
  }, [profiles]);

  const registerParent = useCallback(async (data: RegistrationData): Promise<Profile> => {
    console.log('[registerParent] Registering parent:', data.parentName);
    const { profile, updatedProfiles } = profileService.registerParent(data, profiles);

    // Save parent profile to Supabase
    const savedProfile = await supabaseProfileService.saveProfile(profile);

    if (savedProfile) {
      // Use the profile from Supabase (has correct UUID)
      localStorage.setItem('parentProfile', JSON.stringify(savedProfile));
      localStorage.setItem('isRegistrationComplete', 'true');

      setParentProfile(savedProfile);
      setProfiles(prev => [...prev, savedProfile]);
      setIsRegistrationComplete(true);
      console.log('[registerParent] Parent profile saved successfully:', savedProfile.id);
      return savedProfile;
    } else {
      // Fallback to local profile if Supabase save fails
      console.error('[registerParent] Failed to save to Supabase, using local profile');
      localStorage.setItem('parentProfile', JSON.stringify(profile));
      localStorage.setItem('isRegistrationComplete', 'true');

      setParentProfile(profile);
      setProfiles(prev => [...prev, profile]);
      setIsRegistrationComplete(true);
      return profile;
    }
  }, [profiles]);

  const addGoal = useCallback(async (profileId: string, goalId: string, goalName: string, phaseSize?: number) => {
    console.log('[addGoal] Adding goal:', { profileId, goalId, goalName });
    
    try {
      // Validate profile exists
      const targetProfile = profiles.find(p => p.id === profileId);
      if (!targetProfile) {
        console.error('[addGoal] Profile not found:', profileId);
        return;
      }

      // Check if goal already exists
      if (targetProfile.goals?.some(g => g.id === goalId)) {
        console.warn('[addGoal] Goal already exists');
        return;
      }

      // Add to Supabase
      const success = await supabaseProfileService.addGoalToProfile(profileId, goalId, goalName, phaseSize);
      
      if (success) {
        // Reload the profile with updated goals
        const updatedProfile = await supabaseProfileService.loadProfileWithGoals(profileId);
        if (updatedProfile) {
          // Update profiles array
          setProfiles(prevProfiles =>
            prevProfiles.map(p => p.id === profileId ? updatedProfile : p)
          );
          // Update current profile if it's the one we just modified
          if (currentProfile.id === profileId) {
            setCurrentProfile(updatedProfile);
          }
        }
      }
    } catch (error) {
      console.error('[addGoal] Error:', error);
    }
  }, [profiles, currentProfile]);

  const addGoalWithPhaseSize = useCallback((profileId: string, goalId: string, goalName: string, phaseSize: number) => {
    addGoal(profileId, goalId, goalName, phaseSize);
  }, [addGoal]);

  const updateGoalPhaseSize = useCallback(async (profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => {
    console.log('[updateGoalPhaseSize] Updating:', { profileId, goalId, newPhaseSize });

    try {
      const { supabase } = await import('@/lib/supabase');

      // Update in Supabase
      const { error } = await supabase
        .from('goals')
        .update({
          phase_size: newPhaseSize,
          current_unit_id: unitId?.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', profileId)
        .eq('goal_id', goalId);

      if (error) {
        console.error('[updateGoalPhaseSize] Error:', error);
        return;
      }

      // Reload profile
      const updatedProfile = await supabaseProfileService.loadProfileWithGoals(profileId);
      if (updatedProfile) {
        setProfiles(prevProfiles =>
          prevProfiles.map(p => p.id === profileId ? updatedProfile : p)
        );
        if (currentProfile.id === profileId) {
          setCurrentProfile(updatedProfile);
        }
      }
    } catch (error) {
      console.error('[updateGoalPhaseSize] Exception:', error);
    }
  }, [currentProfile]);

  const updateProfile = useCallback(async (profileId: string, updates: ProfileUpdate) => {
    console.log('[updateProfile] Updating profile:', profileId);
    
    try {
      const success = await supabaseProfileService.updateProfile(profileId, updates);
      if (success) {
        // Reload profile
        const updatedProfile = await supabaseProfileService.loadProfileWithGoals(profileId);
        if (updatedProfile) {
          setProfiles(prevProfiles =>
            prevProfiles.map(p => p.id === profileId ? updatedProfile : p)
          );
          if (currentProfile.id === profileId) {
            setCurrentProfile(updatedProfile);
          }
        }
      }
    } catch (error) {
      console.error('[updateProfile] Error:', error);
    }
  }, [currentProfile]);

  const deleteGoal = useCallback(async (profileId: string, goalId: string) => {
    console.log('[deleteGoal] Deleting goal:', { profileId, goalId });
    
    try {
      const success = await supabaseProfileService.deleteGoalFromProfile(profileId, goalId);
      if (success) {
        // Reload profile
        const updatedProfile = await supabaseProfileService.loadProfileWithGoals(profileId);
        if (updatedProfile) {
          setProfiles(prevProfiles =>
            prevProfiles.map(p => p.id === profileId ? updatedProfile : p)
          );
          if (currentProfile.id === profileId) {
            setCurrentProfile(updatedProfile);
          }
        }
      }
    } catch (error) {
      console.error('[deleteGoal] Error:', error);
    }
  }, [currentProfile]);

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
        isLoading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export { ProfileContext };

/**
 * Create default profiles in Supabase
 */
async function createDefaultProfiles(): Promise<Profile[]> {
  const defaultProfiles: Omit<Profile, 'id'>[] = [
    {
      name: 'Aya',
      type: 'parent',
      avatar: 'avatar-deer',
      email: 'aya@example.com',
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
      name: 'Waleed',
      type: 'child',
      avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fcc50a4fcacab42d49c80a89631bc6bec?format=webp&width=800',
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
      name: 'Zain',
      type: 'child',
      avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa3cffb81fbde4015ad8bedfb2e19a16e?format=webp&width=800',
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

  const savedProfiles: Profile[] = [];
  for (const profile of defaultProfiles) {
    // Add a temporary ID for the profile object (will be replaced by Supabase UUID)
    const profileWithId = { ...profile, id: 'temp-' + Date.now() } as Profile;
    const saved = await supabaseProfileService.saveProfile(profileWithId);
    if (saved) {
      savedProfiles.push(saved);
    }
  }

  return savedProfiles;
}
