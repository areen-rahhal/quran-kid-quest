import { Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/contexts/ProfileContext';
import { Profile } from '@/types/profile';

interface ProfileSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSwitcher = ({ open, onOpenChange }: ProfileSwitcherProps) => {
  const { currentProfile, profiles, switchProfile } = useProfile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileClick = (profile: Profile) => {
    switchProfile(profile.id);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>Switch Profile</SheetTitle>
          <SheetDescription>
            Select a profile to continue your learning journey
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          {profiles.map((profile) => {
            const isActive = currentProfile.id === profile.id;
            
            return (
              <button
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:bg-accent ${
                  isActive 
                    ? 'border-primary bg-accent' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      getInitials(profile.name)
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {profile.name}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs capitalize"
                    >
                      {profile.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.currentGoal 
                      ? `${profile.currentGoal} • ${profile.goalsCount} goal${profile.goalsCount !== 1 ? 's' : ''}`
                      : 'No active goals'}
                  </p>
                </div>

                {isActive && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
