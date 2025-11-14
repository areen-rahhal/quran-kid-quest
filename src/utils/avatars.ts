export interface AvatarOption {
  id: string;
  image: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-waleed',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fcc50a4fcacab42d49c80a89631bc6bec?format=webp&width=800',
  },
  {
    id: 'avatar-zain',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa3cffb81fbde4015ad8bedfb2e19a16e?format=webp&width=800',
  },
  {
    id: 'avatar-bird',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2F37b5892531844d678a879db622149ca1?format=webp&width=800',
  },
  {
    id: 'avatar-deer',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2F5c82b1a379374de6ac6cf873e93c9e17?format=webp&width=800',
  },
  {
    id: 'avatar-koala',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2F1b55c0e17a7b46f28f86ac66e757e6bb?format=webp&width=800',
  },
  {
    id: 'avatar-sheep',
    image: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa9f0debaa6ba45388cfbca30e3525880?format=webp&width=800',
  },
];

export const getAvatarOption = (id: string): AvatarOption | undefined => {
  return AVATAR_OPTIONS.find(avatar => avatar.id === id);
};

export const getRandomAvatar = (): AvatarOption => {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
};

export const getAvatarImageUrl = (avatarId: string): string => {
  const avatar = getAvatarOption(avatarId);
  if (avatar?.image) return avatar.image;

  // Fallback for old avatar IDs (avatar-1, avatar-2, etc.)
  // Map to new avatar options
  const fallbackMap: { [key: string]: string } = {
    'avatar-1': AVATAR_OPTIONS[0].image,
    'avatar-2': AVATAR_OPTIONS[1].image,
    'avatar-3': AVATAR_OPTIONS[2].image,
    'avatar-4': AVATAR_OPTIONS[3].image,
    'avatar-5': AVATAR_OPTIONS[4].image,
    'avatar-6': AVATAR_OPTIONS[5].image,
  };

  return fallbackMap[avatarId] || AVATAR_OPTIONS[0].image;
};
