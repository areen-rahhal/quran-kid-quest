export interface AvatarOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'avatar-1', name: 'Hana', emoji: '👧', color: 'bg-pink-200' },
  { id: 'avatar-2', name: 'Ali', emoji: '👦', color: 'bg-blue-200' },
  { id: 'avatar-3', name: 'Leila', emoji: '👩', color: 'bg-purple-200' },
  { id: 'avatar-4', name: 'Tariq', emoji: '👨', color: 'bg-green-200' },
  { id: 'avatar-5', name: 'Maryam', emoji: '👩‍🎓', color: 'bg-yellow-200' },
  { id: 'avatar-6', name: 'Omar', emoji: '👨‍🎓', color: 'bg-indigo-200' },
];

export const getAvatarOption = (id: string): AvatarOption | undefined => {
  return AVATAR_OPTIONS.find(avatar => avatar.id === id);
};

export const getRandomAvatar = (): AvatarOption => {
  return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
};
