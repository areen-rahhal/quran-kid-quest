import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';
import { RegistrationData } from '@/lib/validation';
import { profileService } from '@/services/profileService';
import { supabaseProfileService } from '@/services/supabaseProfileService';
import { getSupabaseHealth } from '@/lib/supabaseHealth';

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
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
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

interface ProfileProviderProps {
  children: ReactNode;
  authenticatedUser?: User | null;
}

export function ProfileProvider({ children, authenticatedUser }: ProfileProviderProps) {
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
        const userEmail = authenticatedUser?.email?.toLowerCase();
        console.log('[ProfileProvider] Initializing profiles for user:', userEmail);

        // If no authenticated user, don't try to load profiles
        if (!authenticatedUser || !userEmail) {
          console.log('[ProfileProvider] No authenticated user, skipping profile load');
          setCurrentProfile(defaultEmptyProfile);
          setProfiles([]);
          setCurrentParentId(null);
          setParentProfile(null);
          setIsLoading(false);
          return;
        }

        // Check if Supabase is reachable
        const isSupabaseHealthy = await getSupabaseHealth();
        if (!isSupabaseHealthy) {
          console.warn('[ProfileProvider] Supabase is not reachable - will continue with cached data only');
        }

        // STEP 1: Restore cached profile data immediately (cache-first strategy)
        const cachedParentId = localStorage.getItem('currentParentId');
        const cachedParentProfile = localStorage.getItem('parentProfile');

        if (cachedParentId && cachedParentProfile) {
          try {
            const parentProfile = JSON.parse(cachedParentProfile);
            console.log('[ProfileProvider] ✅ Restored cached parent profile:', parentProfile.name, '(showing immediately)');

            setCurrentParentId(cachedParentId);
            setParentProfile(parentProfile);
            setCurrentProfile(parentProfile);
            setProfiles([parentProfile]);
            // Mark as done loading - we have cached data to show
            setIsLoading(false);

            // STEP 2: Refresh data in background without blocking UI
            console.log('[ProfileProvider] Refreshing profile data in background...');
            try {
              // Load parent and children in parallel for better performance
              const parentAndChildren = await supabaseProfileService.loadProfilesForParent(cachedParentId);
              if (parentAndChildren.length > 0) {
                // Load goals for all profiles in parallel
                const profilesWithGoals = await supabaseProfileService.loadProfilesWithGoals(parentAndChildren);

                console.log('[ProfileProvider] ✅ Refreshed profile data from Supabase');
                setProfiles(profilesWithGoals);
                setCurrentProfile(profilesWithGoals[0]);

                // Update cache
                const updatedParent = profilesWithGoals.find(p => p.type === 'parent');
                if (updatedParent) {
                  localStorage.setItem('parentProfile', JSON.stringify(updatedParent));
                }
              }
            } catch (error) {
              console.warn('[ProfileProvider] Background refresh failed (keeping cached data):', error);
              // This is OK - we already showed the cached data, let it stay
            }
            return;
          } catch (error) {
            console.warn('[ProfileProvider] Failed to parse cached profile, will fetch fresh:', error);
            // Fall through to fetch from Supabase
          }
        }

        // STEP 3: Fetch fresh data if no cache exists
        console.log('[ProfileProvider] No cached data, fetching from Supabase...');
        setIsLoading(true);

        try {
          // Load all profiles to find one matching this email
          const allProfiles = await supabaseProfileService.loadProfiles();
          console.log('[ProfileProvider] Loaded all profiles:', allProfiles.length);

          // Find a parent profile matching the authenticated user's email
          const matchingParent = allProfiles.find(
            p => p.type === 'parent' && p.email?.toLowerCase() === userEmail
          );

          if (matchingParent) {
            console.log('[ProfileProvider] Found matching parent for authenticated user:', userEmail);
            // Load that parent and their children in parallel with goals
            const parentAndChildren = await supabaseProfileService.loadProfilesForParent(matchingParent.id);

            // Load goals but don't fail if this times out - still show profiles
            let profilesWithGoals = parentAndChildren;
            try {
              profilesWithGoals = await supabaseProfileService.loadProfilesWithGoals(parentAndChildren);
              console.log('[ProfileProvider] ✅ Loaded goals for all profiles');
            } catch (goalsError) {
              console.warn('[ProfileProvider] Failed to load goals (will show profiles without goals):', goalsError);
              // Use profiles without goals - they still have the basic data
              profilesWithGoals = parentAndChildren;
            }

            setCurrentParentId(matchingParent.id);
            setProfiles(profilesWithGoals);
            setCurrentProfile(profilesWithGoals[0]);
            setParentProfile(matchingParent);

            // Cache the parent ID for quick access
            localStorage.setItem('currentParentId', matchingParent.id);
            localStorage.setItem('parentProfile', JSON.stringify(matchingParent));
            localStorage.setItem('isRegistrationComplete', 'true');

            console.log('[ProfileProvider] ✅ Profiles loaded successfully for:', userEmail);
            setIsLoading(false);
            return;
          } else {
            // No profile found for this authenticated user - they need to register
            console.log('[ProfileProvider] No profile found for authenticated user:', userEmail, '- user needs to register');
            setCurrentProfile(defaultEmptyProfile);
            setProfiles([]);
            setCurrentParentId(null);
            setParentProfile(null);
            setIsLoading(false);
            return;
          }
        } catch (fetchError) {
          console.error('[ProfileProvider] Failed to fetch profiles from Supabase:', fetchError);
          // Don't block the UI - user can still navigate
          setCurrentProfile(defaultEmptyProfile);
          setProfiles([]);
          setCurrentParentId(null);
          setParentProfile(null);
          setIsLoading(false);
          return;
        }

      } catch (error) {
        console.error('[ProfileProvider] Error initializing profiles:', error);
        setIsLoading(false);
      }
    };

    initializeProfiles();
  }, [authenticatedUser]);

  const switchProfile = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      console.log('[switchProfile] Switching to profile:', profile.name, 'Type:', profile.type);
      setCurrentProfile(profile);

      // If switching to a parent profile, update currentParentId
      if (profile.type === 'parent') {
        console.log('[switchProfile] Updating currentParentId to:', profileId);
        setCurrentParentId(profileId);
        localStorage.setItem('currentParentId', profileId);
      }
      // If switching to a child profile, find and set its parent
      else if (profile.parentId) {
        console.log('[switchProfile] Child profile, parent is:', profile.parentId);
        setCurrentParentId(profile.parentId);
        localStorage.setItem('currentParentId', profile.parentId);
      }
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
    console.log('[addGoal] Note: Add Goal UI is being rebuilt. New implementation coming soon.');

    try {
      // Validate profile ID is valid (not the default placeholder)
      if (!profileId || profileId === 'unknown') {
        console.error('[addGoal] Invalid profile ID:', profileId);
        throw new Error('Profile not loaded yet. Please wait for profiles to load.');
      }

      // Validate profile exists
      const targetProfile = profiles.find(p => p.id === profileId);
      if (!targetProfile) {
        console.error('[addGoal] Profile not found:', profileId);
        throw new Error(`Profile with ID ${profileId} not found in loaded profiles.`);
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

  const updateProfile = useCallback(async (profileId: string, updates: Partial<Profile>) => {
    console.log('[updateProfile] Updating profile:', profileId);

    try {
      const result = await supabaseProfileService.updateProfile(profileId, updates);
      if (result) {
        // Reload profile
        const updatedProfile = await supabaseProfileService.loadProfileWithGoals(profileId);
        if (updatedProfile) {
          setProfiles(prevProfiles =>
            prevProfiles.map(p => p.id === profileId ? updatedProfile : p)
          );
          if (currentProfile.id === profileId) {
            setCurrentProfile(updatedProfile);
          }

          // Update cache if this is the parent profile
          if (updatedProfile.type === 'parent') {
            console.log('[updateProfile] Updating cached parent profile');
            localStorage.setItem('parentProfile', JSON.stringify(updatedProfile));
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
    localStorage.removeItem('loginEmail');
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

/**
 * Hook to access profile context
 * @throws Error if used outside ProfileProvider
 */
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
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
