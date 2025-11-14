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
    'avatar-3': AVATAR_OPTIONS[0].image,
    'avatar-4': AVATAR_OPTIONS[1].image,
    'avatar-5': AVATAR_OPTIONS[0].image,
    'avatar-6': AVATAR_OPTIONS[1].image,
  };

  return fallbackMap[avatarId] || AVATAR_OPTIONS[0].image;
};
