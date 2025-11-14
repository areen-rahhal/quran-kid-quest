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
  return avatar?.image || '';
};
