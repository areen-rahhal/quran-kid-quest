import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import { profileService } from '@/services/profileService';
import { supabaseProfileService } from '@/services/supabaseProfileService';

interface ProfileContextType {
  currentProfile: Profile;
  profiles: Profile[];
  currentParentId: string | null;
  switchProfile: (profileId: string) => void;
  registerParent: (data: RegistrationData) => Promise<Profile>;
  createChildProfile: (childData: Omit<Profile, 'id'>) => Promise<Profile | null>;
  addGoal: (profileId: string, goalId: string, goalName: string, phaseSize?: number) => void;
  addGoalWithPhaseSize: (profileId: string, goalId: string, goalName: string, phaseSize: number) => void;
  updateGoalPhaseSize: (profileId: string, goalId: string, newPhaseSize: number, unitId?: number) => void;
  updateProfile: (profileId: string, updates: ProfileUpdate) => void;
  deleteGoal: (profileId: string, goalId: string) => void;
  logout: () => void;
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
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState<boolean>(false);
  const [parentProfile, setParentProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize profiles from Supabase
  useEffect(() => {
    const initializeProfiles = async () => {
      try {
        console.log('[ProfileProvider] Initializing profiles from Supabase');
        setIsLoading(true);

        // TIER 2 OPTIMIZATION: Check localStorage first to avoid redundant loadProfiles() call
        const savedParentId = localStorage.getItem('currentParentId');

        // Path 1: User has logged in before (savedParentId exists)
        if (savedParentId) {
          console.log('[ProfileProvider] Found saved parent ID in localStorage:', savedParentId);
          const parentAndChildren = await supabaseProfileService.loadProfilesForParent(savedParentId);

          if (parentAndChildren.length > 0) {
            // Use loadProfilesWithGoals to avoid redundant profile fetches
            const profilesWithGoals = await supabaseProfileService.loadProfilesWithGoals(parentAndChildren);

            setCurrentParentId(savedParentId);
            setProfiles(profilesWithGoals);
            setCurrentProfile(profilesWithGoals[0]);

            // Load registration status
            const regStatus = localStorage.getItem('isRegistrationComplete') === 'true';
            setIsRegistrationComplete(regStatus);

            // Load parent profile from localStorage
            const parentData = localStorage.getItem('parentProfile');
            if (parentData) {
              try {
                setParentProfile(JSON.parse(parentData));
              } catch (e) {
                console.error('Failed to parse parent profile', e);
              }
            }

            setIsLoading(false);
            return;
          }
        }

        // Path 2: No savedParentId, need to load all profiles
        console.log('[ProfileProvider] No saved parent ID, loading all profiles');
        const allProfiles = await supabaseProfileService.loadProfiles();
        console.log('[ProfileProvider] Loaded all profiles:', allProfiles.length);

        if (allProfiles.length === 0) {
          console.log('[ProfileProvider] No profiles in Supabase, creating defaults');
          // Create default profiles if none exist
          const defaultProfiles = await createDefaultProfiles();
          setProfiles(defaultProfiles);
          const parentProfile = defaultProfiles.find(p => p.type === 'parent');
          if (parentProfile) {
            setCurrentParentId(parentProfile.id);
            setCurrentProfile(parentProfile);
          }
        } else {
          // Find first parent from loaded profiles
          const firstParent = allProfiles.find(p => p.type === 'parent');
          const parentIdToLoad = firstParent?.id;

          if (parentIdToLoad) {
            console.log('[ProfileProvider] Loading profiles for parent:', parentIdToLoad);
            // Load parent and their children
            const parentAndChildren = await supabaseProfileService.loadProfilesForParent(parentIdToLoad);
            // Use loadProfilesWithGoals to avoid redundant profile fetches
            const profilesWithGoals = await supabaseProfileService.loadProfilesWithGoals(parentAndChildren);

            setCurrentParentId(parentIdToLoad);
            setProfiles(profilesWithGoals);
            if (profilesWithGoals.length > 0) {
              setCurrentProfile(profilesWithGoals[0]);
            }
          } else {
            // Fallback: load all profiles with goals
            const profilesWithGoals = await supabaseProfileService.loadProfilesWithGoals(allProfiles);
            setProfiles(profilesWithGoals);
            if (profilesWithGoals.length > 0) {
              setCurrentProfile(profilesWithGoals[0]);
            }
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

    // Save parent profile to Supabase (no parentId for parent profiles)
    const savedProfile = await supabaseProfileService.saveProfile(profile);

    if (savedProfile) {
      // Use the profile from Supabase (has correct UUID)
      localStorage.setItem('parentProfile', JSON.stringify(savedProfile));
      localStorage.setItem('isRegistrationComplete', 'true');
      localStorage.setItem('currentParentId', savedProfile.id);

      setParentProfile(savedProfile);
      setCurrentParentId(savedProfile.id);
      setProfiles(prev => [...prev, savedProfile]);
      setCurrentProfile(savedProfile);
      setIsRegistrationComplete(true);
      console.log('[registerParent] Parent profile saved successfully:', savedProfile.id);
      return savedProfile;
    } else {
      // Fallback to local profile if Supabase save fails
      console.error('[registerParent] Failed to save to Supabase, using local profile');
      localStorage.setItem('parentProfile', JSON.stringify(profile));
      localStorage.setItem('isRegistrationComplete', 'true');
      localStorage.setItem('currentParentId', profile.id);

      setParentProfile(profile);
      setCurrentParentId(profile.id);
      setProfiles(prev => [...prev, profile]);
      setCurrentProfile(profile);
      setIsRegistrationComplete(true);
      return profile;
    }
  }, [profiles]);

  const createChildProfile = useCallback(async (childData: Omit<Profile, 'id'>): Promise<Profile | null> => {
    if (!currentParentId) {
      console.error('[createChildProfile] No current parent ID set');
      return null;
    }

    console.log('[createChildProfile] Creating child for parent:', currentParentId);

    // Validate child count limit
    if (!profileService.validateChildCountLimit(profiles, currentParentId)) {
      console.error('[createChildProfile] Parent already has 3 children');
      return null;
    }

    // Create child profile in Supabase
    const savedChild = await supabaseProfileService.createChildProfile(currentParentId, childData);

    if (savedChild) {
      console.log('[createChildProfile] Child profile created successfully:', savedChild.id);
      setProfiles(prev => [...prev, savedChild]);
      return savedChild;
    } else {
      console.error('[createChildProfile] Failed to create child profile');
      return null;
    }
  }, [currentParentId, profiles]);

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

  const logout = useCallback(() => {
    console.log('[logout] Logging out user');
    // Clear profile state
    setCurrentProfile(defaultEmptyProfile);
    setProfiles([]);
    setCurrentParentId(null);
    setParentProfile(null);
    setIsRegistrationComplete(false);

    // Clear localStorage
    localStorage.removeItem('parentProfile');
    localStorage.removeItem('currentParentId');
    localStorage.removeItem('isRegistrationComplete');
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        profiles,
        currentParentId,
        switchProfile,
        registerParent,
        createChildProfile,
        addGoal,
        addGoalWithPhaseSize,
        updateGoalPhaseSize,
        updateProfile,
        deleteGoal,
        logout,
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
 * TIER 2 OPTIMIZATION: Parallelize saves using Promise.all instead of sequential saves
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

  // Create profile objects with temporary IDs
  const profilesWithTempIds = defaultProfiles.map((profile, index) => ({
    ...profile,
    id: 'temp-' + Date.now() + '-' + index, // Add index to ensure unique IDs in parallel saves
  })) as Profile[];

  // Parallelize saves using Promise.all
  const savePromises = profilesWithTempIds.map(profile =>
    supabaseProfileService.saveProfile(profile)
  );

  const savedResults = await Promise.all(savePromises);

  // Filter out null results (failed saves)
  const savedProfiles = savedResults.filter((p): p is Profile => p !== null);

  return savedProfiles;
}
