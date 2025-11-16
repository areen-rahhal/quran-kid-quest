import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { profileService } from '../profileService';
import { Profile, RegistrationData, ProfileUpdate } from '@/lib/validation';
import * as storageServiceModule from '../storageService';

vi.mock('../storageService');

const mockProfile: Profile = {
  id: '1',
  name: 'Test User',
  type: 'child',
  goalsCount: 0,
};

const mockProfiles: Profile[] = [mockProfile];

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeProfiles', () => {
    it('should load profiles from storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'loadProfiles').mockReturnValue(
        mockProfiles
      );

      const result = profileService.initializeProfiles([]);
      expect(result).toEqual(mockProfiles);
    });

    it('should return fallback if storage empty', () => {
      const fallback: Profile[] = [
        {
          id: '2',
          name: 'Fallback',
          type: 'parent',
          goalsCount: 0,
        },
      ];
      vi.spyOn(storageServiceModule.storageService, 'loadProfiles').mockReturnValue(
        fallback
      );

      const result = profileService.initializeProfiles(fallback);
      expect(result).toEqual(fallback);
    });
  });

  describe('initializeCurrentProfile', () => {
    it('should load current profile from storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'loadCurrentProfile').mockReturnValue(
        mockProfile
      );

      const result = profileService.initializeCurrentProfile(mockProfiles);
      expect(result).toEqual(mockProfile);
    });

    it('should return first profile if no current profile in storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'loadCurrentProfile').mockReturnValue(
        null
      );

      const result = profileService.initializeCurrentProfile(mockProfiles);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('initializeRegistrationStatus', () => {
    it('should load registration status from storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'loadRegistrationStatus').mockReturnValue(
        true
      );

      const result = profileService.initializeRegistrationStatus();
      expect(result).toBe(true);
    });
  });

  describe('initializeParentProfile', () => {
    it('should load parent profile from storage', () => {
      const parentProfile: Profile = { ...mockProfile, id: 'parent-1', type: 'parent' };
      vi.spyOn(storageServiceModule.storageService, 'loadParentProfile').mockReturnValue(
        parentProfile
      );

      const result = profileService.initializeParentProfile();
      expect(result).toEqual(parentProfile);
    });

    it('should return null if no parent profile in storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'loadParentProfile').mockReturnValue(
        null
      );

      const result = profileService.initializeParentProfile();
      expect(result).toBeNull();
    });
  });

  describe('registerParent', () => {
    it('should register a new parent profile', () => {
      vi.spyOn(storageServiceModule.storageService, 'saveProfiles');
      vi.spyOn(storageServiceModule.storageService, 'saveCurrentProfile');
      vi.spyOn(storageServiceModule.storageService, 'saveRegistrationStatus');
      vi.spyOn(storageServiceModule.storageService, 'saveParentProfile');

      const registrationData: RegistrationData = {
        email: 'parent@example.com',
        password: 'password123',
        parentName: 'Parent Name',
        avatar: 'avatar-1',
      };

      const { profile, updatedProfiles } = profileService.registerParent(
        registrationData,
        mockProfiles
      );

      expect(profile.name).toBe('Parent Name');
      expect(profile.type).toBe('parent');
      expect(profile.email).toBe('parent@example.com');
      expect(updatedProfiles.length).toBe(mockProfiles.length + 1);
      expect(storageServiceModule.storageService.saveProfiles).toHaveBeenCalledWith(
        updatedProfiles
      );
    });
  });

  describe('switchProfile', () => {
    it('should switch to a different profile', () => {
      const profile2: Profile = { id: '2', name: 'User 2', type: 'child', goalsCount: 0 };
      const profiles = [mockProfile, profile2];

      vi.spyOn(storageServiceModule.storageService, 'saveCurrentProfile');

      const result = profileService.switchProfile(profiles, '2');

      expect(result).toEqual(profile2);
      expect(storageServiceModule.storageService.saveCurrentProfile).toHaveBeenCalledWith(
        profile2
      );
    });

    it('should return null if profile does not exist', () => {
      const result = profileService.switchProfile(mockProfiles, 'non-existent');
      expect(result).toBeNull();
    });
  });

  describe('addGoal', () => {
    it('should add a goal to a profile', () => {
      vi.spyOn(storageServiceModule.storageService, 'saveProfiles');
      vi.spyOn(storageServiceModule.storageService, 'saveCurrentProfile');

      const { updatedProfiles, updatedCurrentProfile } = profileService.addGoal(
        mockProfiles,
        '1',
        'surah-fatiha',
        'Surah Al-Fatiha'
      );

      expect(updatedProfiles[0]?.goals?.length).toBe(1);
      expect(updatedProfiles[0]?.goalsCount).toBe(1);
      expect(updatedCurrentProfile.goals?.length).toBe(1);
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal from a profile', () => {
      let profile = mockProfile;
      // First add a goal
      const { updatedProfiles: profilesWithGoal } = profileService.addGoal(
        [profile],
        '1',
        'surah-fatiha',
        'Surah Al-Fatiha'
      );

      vi.spyOn(storageServiceModule.storageService, 'saveProfiles');
      vi.spyOn(storageServiceModule.storageService, 'saveCurrentProfile');

      // Then delete it
      const { updatedProfiles } = profileService.deleteGoal(
        profilesWithGoal,
        '1',
        'surah-fatiha'
      );

      expect(updatedProfiles[0]?.goals?.length).toBe(0);
      expect(updatedProfiles[0]?.goalsCount).toBe(0);
    });
  });

  describe('updateProfile', () => {
    it('should update profile details', () => {
      vi.spyOn(storageServiceModule.storageService, 'saveProfiles');
      vi.spyOn(storageServiceModule.storageService, 'saveCurrentProfile');

      const updates: ProfileUpdate = {
        name: 'Updated Name',
        age: 15,
      };

      const { updatedProfiles, updatedCurrentProfile } = profileService.updateProfile(
        mockProfiles,
        '1',
        updates
      );

      expect(updatedProfiles[0]?.name).toBe('Updated Name');
      expect(updatedProfiles[0]?.age).toBe(15);
      expect(updatedCurrentProfile.name).toBe('Updated Name');
    });
  });

  describe('getProfileById', () => {
    it('should retrieve a profile by ID', () => {
      const profile2: Profile = { id: '2', name: 'User 2', type: 'child', goalsCount: 0 };
      const profiles = [mockProfile, profile2];

      const result = profileService.getProfileById(profiles, '2');
      expect(result).toEqual(profile2);
    });

    it('should return undefined if profile not found', () => {
      const result = profileService.getProfileById(mockProfiles, 'non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('profileExists', () => {
    it('should return true if profile exists', () => {
      const result = profileService.profileExists(mockProfiles, '1');
      expect(result).toBe(true);
    });

    it('should return false if profile does not exist', () => {
      const result = profileService.profileExists(mockProfiles, 'non-existent');
      expect(result).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all storage', () => {
      vi.spyOn(storageServiceModule.storageService, 'clearAll');

      profileService.clearAll();

      expect(storageServiceModule.storageService.clearAll).toHaveBeenCalled();
    });
  });
});
