import { useTranslation } from 'react-i18next';
import { useGoals } from '@/hooks/useGoals';
import { useProfile } from '@/contexts/ProfileContext';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types/profile';

interface GoalsModalMenuProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export const GoalsModalMenu = ({ profile, isOpen, onClose }: GoalsModalMenuProps) => {
  console.log('[GoalsModalMenu] rendered, isOpen:', isOpen, 'profile:', profile?.name);
  const { t, i18n } = useTranslation();
  const { allGoals } = useGoals();
  console.log('[GoalsModalMenu] allGoals loaded:', allGoals?.length);
  const { addGoal } = useProfile();
  const isArabic = i18n.language === 'ar';

  // Get IDs of goals already added to this profile
  const addedGoalIds = new Set(profile.goals?.map(g => g.id) || []);
  console.log('[GoalsModalMenu] addedGoalIds:', Array.from(addedGoalIds));

  const handleGoalSelect = (goalId: string, goalName: string) => {
    console.log('[handleGoalSelect] called with goalId:', goalId, 'goalName:', goalName);
    try {
      addGoal(profile.id, goalId, goalName);
      console.log('[handleGoalSelect] addGoal completed');
      onClose();
    } catch (error) {
      console.error('[handleGoalSelect] ERROR:', error);
      throw error;
    }
  };

  if (!isOpen) {
    console.log('[GoalsModalMenu] not open, returning null');
    return null;
  }

  console.log('[GoalsModalMenu] rendering modal with', allGoals?.length, 'goals');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex flex-col bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {t('learnersProfiles.selectGoal')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {allGoals.map((goal) => {
              const isAdded = addedGoalIds.has(goal.id);
              const goalName = isArabic ? goal.nameArabic : goal.nameEnglish;

              return (
                <button
                  key={goal.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isAdded) handleGoalSelect(goal.id, goal.nameEnglish);
                  }}
                  disabled={isAdded}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left
                    ${
                      isAdded
                        ? 'bg-muted border-border text-muted-foreground cursor-not-allowed opacity-60'
                        : 'bg-gradient-soft border-primary/20 hover:border-primary hover:shadow-md active:scale-95 cursor-pointer'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-base">{goalName}</span>
                    {isAdded && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('learnersProfiles.alreadyAdded')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
