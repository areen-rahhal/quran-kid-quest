import { describe, it, expect, vi } from 'vitest';
import { AVATAR_OPTIONS, getAvatarOption, getRandomAvatar } from '@/utils/avatars';

describe('Avatar utilities', () => {
  describe('AVATAR_OPTIONS', () => {
    it('should have 6 avatar options', () => {
      expect(AVATAR_OPTIONS).toHaveLength(6);
    });

    it('should have required properties for each avatar', () => {
      AVATAR_OPTIONS.forEach(avatar => {
        expect(avatar).toHaveProperty('id');
        expect(avatar).toHaveProperty('name');
        expect(avatar).toHaveProperty('emoji');
        expect(avatar).toHaveProperty('color');
      });
    });

    it('should have unique ids', () => {
      const ids = AVATAR_OPTIONS.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid tailwind color classes', () => {
      const validColors = ['bg-pink-200', 'bg-blue-200', 'bg-purple-200', 'bg-green-200', 'bg-yellow-200', 'bg-indigo-200'];
      AVATAR_OPTIONS.forEach(avatar => {
        expect(validColors).toContain(avatar.color);
      });
    });

    it('should have emoji strings', () => {
      AVATAR_OPTIONS.forEach(avatar => {
        expect(typeof avatar.emoji).toBe('string');
        expect(avatar.emoji.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getAvatarOption', () => {
    it('should return avatar by valid id', () => {
      const avatar = getAvatarOption('avatar-1');
      expect(avatar).toBeDefined();
      expect(avatar?.name).toBe('Hana');
    });

    it('should return undefined for invalid id', () => {
      const avatar = getAvatarOption('invalid-id');
      expect(avatar).toBeUndefined();
    });

    it('should return avatar with all properties', () => {
      const avatar = getAvatarOption('avatar-2');
      expect(avatar).toEqual({
        id: 'avatar-2',
        name: 'Ali',
        emoji: '👦',
        color: 'bg-blue-200',
      });
    });

    it('should find all avatars by id', () => {
      const ids = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];
      ids.forEach(id => {
        const avatar = getAvatarOption(id);
        expect(avatar).toBeDefined();
        expect(avatar?.id).toBe(id);
      });
    });

    it('should handle case-sensitive search', () => {
      const avatar = getAvatarOption('AVATAR-1');
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
      expect(avatar).toHaveProperty('name');
      expect(avatar).toHaveProperty('emoji');
      expect(avatar).toHaveProperty('color');
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
});
