import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storageService } from '../storageService';
import { Profile } from '@/lib/validation';

const mockProfile: Profile = {
  id: '1',
  name: 'Test User',
  type: 'child',
  goalsCount: 0,
};

const mockProfiles: Profile[] = [mockProfile];

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveProfiles and loadProfiles', () => {
    it('should save and load profiles', () => {
      storageService.saveProfiles(mockProfiles);
      const loaded = storageService.loadProfiles([]);
      expect(loaded).toEqual(mockProfiles);
    });

    it('should return fallback if no profiles saved', () => {
      const fallback: Profile[] = [{ id: '2', name: 'Fallback', type: 'parent', goalsCount: 0 }];
      const loaded = storageService.loadProfiles(fallback);
      expect(loaded).toEqual(fallback);
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('profiles', 'invalid json');
      const fallback: Profile[] = [mockProfile];
      const loaded = storageService.loadProfiles(fallback);
      expect(loaded).toEqual(fallback);
    });
  });

  describe('saveCurrentProfile and loadCurrentProfile', () => {
    it('should save and load current profile', () => {
      storageService.saveCurrentProfile(mockProfile);
      const loaded = storageService.loadCurrentProfile(mockProfiles);
      expect(loaded).toEqual(mockProfile);
    });

    it('should find profile in list when loading', () => {
      const anotherProfile: Profile = {
        id: '2',
        name: 'Another User',
        type: 'parent',
        goalsCount: 0,
      };
      const profiles = [mockProfile, anotherProfile];
      
      // Save the first profile ID
      localStorage.setItem('currentProfile', JSON.stringify({ id: '1' }));
      
      const loaded = storageService.loadCurrentProfile(profiles);
      expect(loaded?.id).toBe('1');
    });

    it('should return null if no current profile saved', () => {
      const loaded = storageService.loadCurrentProfile(mockProfiles);
      expect(loaded).toBeNull();
    });

    it('should return first profile if saved profile not found', () => {
      const profiles = [mockProfile];
      localStorage.setItem('currentProfile', JSON.stringify({ id: 'nonexistent' }));
      
      const loaded = storageService.loadCurrentProfile(profiles);
      expect(loaded).toEqual(mockProfile);
    });
  });

  describe('saveRegistrationStatus and loadRegistrationStatus', () => {
    it('should save and load registration status', () => {
      storageService.saveRegistrationStatus(true);
      const loaded = storageService.loadRegistrationStatus();
      expect(loaded).toBe(true);
    });

    it('should handle false status', () => {
      storageService.saveRegistrationStatus(false);
      const loaded = storageService.loadRegistrationStatus();
      expect(loaded).toBe(false);
    });

    it('should return false if no status saved', () => {
      const loaded = storageService.loadRegistrationStatus();
      expect(loaded).toBe(false);
    });
  });

  describe('saveParentProfile and loadParentProfile', () => {
    it('should save and load parent profile', () => {
      const parentProfile: Profile = {
        ...mockProfile,
        id: 'parent-1',
        type: 'parent',
      };
      storageService.saveParentProfile(parentProfile);
      const loaded = storageService.loadParentProfile();
      expect(loaded).toEqual(parentProfile);
    });

    it('should handle null parent profile', () => {
      storageService.saveParentProfile(null);
      const loaded = storageService.loadParentProfile();
      expect(loaded).toBeNull();
    });

    it('should return null if no parent profile saved', () => {
      const loaded = storageService.loadParentProfile();
      expect(loaded).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all stored data', () => {
      storageService.saveProfiles(mockProfiles);
      storageService.saveCurrentProfile(mockProfile);
      storageService.saveRegistrationStatus(true);
      
      storageService.clearAll();
      
      expect(storageService.loadProfiles([])).toEqual([]);
      expect(storageService.loadCurrentProfile([])).toBeNull();
      expect(storageService.loadRegistrationStatus()).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = storageService.safeJsonParse('{"name":"test"}', { name: 'fallback' });
      expect(result).toEqual({ name: 'test' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { name: 'fallback' };
      const result = storageService.safeJsonParse('invalid', fallback);
      expect(result).toEqual(fallback);
    });
  });
});
