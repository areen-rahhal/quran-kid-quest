import { Profile, RegistrationDataSchema } from '@/lib/validation';
import { z } from 'zod';

const STORAGE_KEYS = {
  PROFILES: 'profiles',
  CURRENT_PROFILE: 'currentProfile',
  REGISTRATION_COMPLETE: 'isRegistrationComplete',
  PARENT_PROFILE: 'parentProfile',
} as const;

export const storageService = {
  /**
   * Safely parse stored JSON data
   */
  safeJsonParse<T>(data: string, fallback: T): T {
    try {
      return JSON.parse(data) as T;
    } catch {
      return fallback;
    }
  },

  /**
   * Save profiles to localStorage
   */
  saveProfiles(profiles: Profile[]): void {
    try {
      const serialized = JSON.stringify(profiles);
      localStorage.setItem(STORAGE_KEYS.PROFILES, serialized);
    } catch (error) {
      console.error('Failed to save profiles:', error);
      // Try to clear and retry as last resort
      try {
        localStorage.removeItem(STORAGE_KEYS.PROFILES);
        const serialized = JSON.stringify(profiles);
        localStorage.setItem(STORAGE_KEYS.PROFILES, serialized);
      } catch (retryError) {
        console.error('Failed to save profiles even after clearing:', retryError);
      }
    }
  },

  /**
   * Load profiles from localStorage
   */
  loadProfiles(fallback: Profile[]): Profile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!stored) return fallback;
      return this.safeJsonParse(stored, fallback);
    } catch (error) {
      console.error('Failed to load profiles:', error);
      return fallback;
    }
  },

  /**
   * Save current profile to localStorage
   */
  saveCurrentProfile(profile: Profile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Failed to save current profile:', error);
    }
  },

  /**
   * Load current profile from localStorage
   */
  loadCurrentProfile(allProfiles: Profile[]): Profile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE);
      if (!stored) return null;

      const savedProfile = this.safeJsonParse(stored, null);
      if (!savedProfile) return null;

      // Find matching profile in all profiles
      return (
        allProfiles.find((p: Profile) => p.id === savedProfile.id) ||
        allProfiles[0] ||
        null
      );
    } catch (error) {
      console.error('Failed to load current profile:', error);
      return null;
    }
  },

  /**
   * Save registration status
   */
  saveRegistrationStatus(isComplete: boolean): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.REGISTRATION_COMPLETE,
        String(isComplete)
      );
    } catch (error) {
      console.error('Failed to save registration status:', error);
    }
  },

  /**
   * Load registration status
   */
  loadRegistrationStatus(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.REGISTRATION_COMPLETE) === 'true';
    } catch (error) {
      console.error('Failed to load registration status:', error);
      return false;
    }
  },

  /**
   * Save parent profile
   */
  saveParentProfile(profile: Profile | null): void {
    try {
      if (profile) {
        localStorage.setItem(STORAGE_KEYS.PARENT_PROFILE, JSON.stringify(profile));
      } else {
        localStorage.removeItem(STORAGE_KEYS.PARENT_PROFILE);
      }
    } catch (error) {
      console.error('Failed to save parent profile:', error);
    }
  },

  /**
   * Load parent profile
   */
  loadParentProfile(): Profile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PARENT_PROFILE);
      if (!stored) return null;
      return this.safeJsonParse(stored, null);
    } catch (error) {
      console.error('Failed to load parent profile:', error);
      return null;
    }
  },

  /**
   * Clear all stored data
   */
  clearAll(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};
