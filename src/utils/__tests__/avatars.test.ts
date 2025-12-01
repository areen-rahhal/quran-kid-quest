import { describe, it, expect } from 'vitest';
import { AVATAR_OPTIONS, getAvatarOption, getRandomAvatar, getAvatarImageUrl } from '@/utils/avatars';

describe('Avatar utilities', () => {
  describe('AVATAR_OPTIONS', () => {
    it('should have 6 avatar options', () => {
      expect(AVATAR_OPTIONS).toHaveLength(6);
    });

    it('should have required properties for each avatar', () => {
      AVATAR_OPTIONS.forEach(avatar => {
        expect(avatar).toHaveProperty('id');
        expect(avatar).toHaveProperty('image');
      });
    });

    it('should have unique ids', () => {
      const ids = AVATAR_OPTIONS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid image URLs', () => {
      AVATAR_OPTIONS.forEach(avatar => {
        expect(avatar.image).toMatch(/^https?:\/\//);
      });
    });

    it('should have non-empty id strings', () => {
      AVATAR_OPTIONS.forEach(avatar => {
        expect(typeof avatar.id).toBe('string');
        expect(avatar.id.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getAvatarOption', () => {
    it('should return avatar by valid id', () => {
      const avatar = getAvatarOption('avatar-waleed');
      expect(avatar).toBeDefined();
      expect(avatar?.id).toBe('avatar-waleed');
    });

    it('should return undefined for invalid id', () => {
      const avatar = getAvatarOption('invalid-id');
      expect(avatar).toBeUndefined();
    });

    it('should return avatar with all properties', () => {
      const avatar = getAvatarOption('avatar-zain');
      expect(avatar).toHaveProperty('id', 'avatar-zain');
      expect(avatar).toHaveProperty('image');
      expect(avatar?.image).toMatch(/^https?:\/\//);
    });

    it('should find all avatars by id', () => {
      AVATAR_OPTIONS.forEach(expectedAvatar => {
        const avatar = getAvatarOption(expectedAvatar.id);
        expect(avatar).toBeDefined();
        expect(avatar?.id).toBe(expectedAvatar.id);
      });
    });

    it('should handle case-sensitive search', () => {
      const avatar = getAvatarOption('AVATAR-WALEED');
      expect(avatar).toBeUndefined();
    });
  });

  describe('getRandomAvatar', () => {
    it('should return a random avatar', () => {
      const avatar = getRandomAvatar();
      expect(avatar).toBeDefined();
      expect(AVATAR_OPTIONS).toContainEqual(avatar);
    });

    it('should return avatar with all required properties', () => {
      const avatar = getRandomAvatar();
      expect(avatar).toHaveProperty('id');
      expect(avatar).toHaveProperty('image');
    });

    it('should return different avatars over multiple calls (with high probability)', () => {
      const avatars = new Set();
      for (let i = 0; i < 20; i++) {
        avatars.add(getRandomAvatar().id);
      }
      expect(avatars.size).toBeGreaterThan(1);
    });

    it('should return valid avatar from the list', () => {
      const avatar = getRandomAvatar();
      const foundAvatar = AVATAR_OPTIONS.find(a => a.id === avatar.id);
      expect(foundAvatar).toBeDefined();
    });

    it('should distribute avatars somewhat evenly (statistical test)', () => {
      const distribution: Record<string, number> = {};
      const iterations = 600;

      for (let i = 0; i < iterations; i++) {
        const avatar = getRandomAvatar();
        distribution[avatar.id] = (distribution[avatar.id] || 0) + 1;
      }

      const counts = Object.values(distribution);
      const average = iterations / AVATAR_OPTIONS.length;
      
      counts.forEach(count => {
        expect(count).toBeGreaterThan(average * 0.5);
        expect(count).toBeLessThan(average * 1.5);
      });
    });
  });

  describe('getAvatarImageUrl', () => {
    it('should return image URL for valid avatar id', () => {
      const url = getAvatarImageUrl('avatar-waleed');
      expect(url).toMatch(/^https?:\/\//);
    });

    it('should return first avatar image for undefined input', () => {
      const url = getAvatarImageUrl(undefined);
      expect(url).toBe(AVATAR_OPTIONS[0].image);
    });

    it('should return input as-is if it starts with http', () => {
      const inputUrl = 'https://example.com/image.png';
      const url = getAvatarImageUrl(inputUrl);
      expect(url).toBe(inputUrl);
    });

    it('should handle fallback for old avatar IDs', () => {
      const url = getAvatarImageUrl('avatar-1');
      expect(url).toBe(AVATAR_OPTIONS[0].image);
    });

    it('should return default for unknown avatar id', () => {
      const url = getAvatarImageUrl('unknown-avatar');
      expect(url).toBe(AVATAR_OPTIONS[0].image);
    });
  });
});