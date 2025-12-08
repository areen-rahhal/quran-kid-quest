import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AvatarImage } from '@/components/AvatarImage';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { Profile } from '@/types/profile';
import { getAvatarImageUrl } from '@/utils/avatars';

interface ProfileSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSwitcher = ({ open, onOpenChange }: ProfileSwitcherProps) => {
  const { t } = useTranslation();
  const { currentProfile, profiles, switchProfile, currentParentId } = useProfile();

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

  // Group profiles by parent
  const parentProfile = profiles.find(p => p.type === 'parent');
  const childProfiles = profiles.filter(p => p.type === 'child');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh]">
        <SheetHeader>
          <SheetTitle>{t('profileSwitcher.title')}</SheetTitle>
          <SheetDescription>
            {t('profileSwitcher.description')}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Parent Profile Section */}
          {parentProfile && (
            <div className="space-y-2">
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('profileSwitcher.parent')}
                </p>
              </div>
              <button
                key={parentProfile.id}
                onClick={() => handleProfileClick(parentProfile)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:bg-accent ${
                  currentProfile.id === parentProfile.id
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <AvatarImage
                  src={getAvatarImageUrl(parentProfile.avatar)}
                  initials={getInitials(parentProfile.name)}
                  name={parentProfile.name}
                  size="sm"
                />

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {parentProfile.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {t(`profileSwitcher.${parentProfile.type}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {parentProfile.currentGoal
                      ? `${parentProfile.currentGoal} • ${parentProfile.goalsCount} ${
                          parentProfile.goalsCount !== 1 ? 'goals' : 'goal'
                        }`
                      : t('profileSwitcher.noActiveGoals')}
                  </p>
                </div>

                {currentProfile.id === parentProfile.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </button>
            </div>
          )}

          {/* Child Profiles Section */}
          {childProfiles.length > 0 && (
            <div className="space-y-2">
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('profileSwitcher.children')}
                </p>
              </div>
              <div className="space-y-2 pl-2">
                {childProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileClick(profile)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:bg-accent ${
                      currentProfile.id === profile.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <AvatarImage
                      src={getAvatarImageUrl(profile.avatar)}
                      initials={getInitials(profile.name)}
                      name={profile.name}
                      size="sm"
                    />

                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {profile.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {t(`profileSwitcher.${profile.type}`)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.currentGoal
                          ? `${profile.currentGoal} • ${profile.goalsCount} ${
                              profile.goalsCount !== 1 ? 'goals' : 'goal'
                            }`
                          : t('profileSwitcher.noActiveGoals')}
                      </p>
                    </div>

                    {currentProfile.id === profile.id && (
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manage Profiles Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={() => {
              onOpenChange(false);
              window.location.href = '/learners-profiles';
            }}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-accent transition-all"
          >
            <span className="font-semibold text-foreground">{t('profileSwitcher.manageProfiles')}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
