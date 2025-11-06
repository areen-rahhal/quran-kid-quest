import React, { useState } from 'react';
import { Star, Flame, Gem, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfile } from '@/contexts/ProfileContext';

interface AchievementProps {
  stars: number;
  streak: number;
  recitations: number;
  goalsCompleted: number;
}

interface TopNavBarProps {
  achievements?: AchievementProps;
}

export const TopNavBar = ({ achievements }: TopNavBarProps) => {
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
        <div className="container flex h-16 items-center justify-between px-4">
          <button
            onClick={() => setIsProfileSwitcherOpen(true)}
            className="hover:bg-accent rounded-full p-1 transition-colors"
          >
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {currentProfile.avatar ? (
                  <img src={currentProfile.avatar} alt={currentProfile.name} />
                ) : (
                  getInitials(currentProfile.name)
                )}
              </AvatarFallback>
            </Avatar>
          </button>

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
