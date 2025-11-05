import { useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileSwitcher } from '@/components/ProfileSwitcher';
import { useProfile } from '@/contexts/ProfileContext';

export const TopNavBar = () => {
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
        <div className="container flex h-16 items-center px-4">
          <button
            onClick={() => setIsProfileSwitcherOpen(true)}
            className="flex items-center gap-3 hover:bg-accent rounded-lg p-2 transition-colors"
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
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-foreground">
                {currentProfile.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentProfile.type}
              </span>
            </div>
          </button>
        </div>
      </header>

      <ProfileSwitcher 
        open={isProfileSwitcherOpen} 
        onOpenChange={setIsProfileSwitcherOpen} 
      />
    </>
  );
};
