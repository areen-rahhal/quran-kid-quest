import React, { useState } from 'react';
import { Star, Flame, Gem, Trophy, ChevronLeft } from 'lucide-react';
import { AvatarImage } from '@/components/AvatarImage';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfile } from '@/contexts/ProfileContext';
import { getAvatarImageUrl } from '@/utils/avatars';

interface AchievementProps {
  stars: number;
  streak: number;
  recitations: number;
  goalsCompleted: number;
}

interface TopNavBarProps {
  achievements?: AchievementProps;
  onBack?: () => void;
}

export const TopNavBar = ({ achievements, onBack }: TopNavBarProps) => {
  const { currentProfile } = useProfile();
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="hover:bg-accent rounded-full p-2 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setIsProfileSwitcherOpen(true)}
              className="hover:bg-accent rounded-full p-1 transition-colors"
            >
              <AvatarImage
                src={getAvatarImageUrl(currentProfile.avatar)}
                initials={getInitials(currentProfile.name)}
                name={currentProfile.name}
                size="sm"
              />
            </button>
          </div>

          {achievements && (
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-foreground">{achievements.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-warning" />
                <span className="text-sm font-bold text-foreground">{achievements.streak}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gem className="w-4 h-4 text-secondary" />
                <span className="text-sm font-bold text-foreground">{achievements.recitations}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="text-sm font-bold text-foreground">{achievements.goalsCompleted}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <ProfileSwitcher
        open={isProfileSwitcherOpen}
        onOpenChange={setIsProfileSwitcherOpen}
      />
    </>
  );
};
