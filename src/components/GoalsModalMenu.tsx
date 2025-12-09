import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoals } from '@/hooks/useGoals';
import { useProfile } from '@/hooks/useProfile';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoalsModalMenuProps {
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
}

const GoalsModalMenuComponent = ({ profileId, isOpen, onClose }: GoalsModalMenuProps) => {
  const { t, i18n } = useTranslation();
  const { allGoals } = useGoals();
  const { addGoal, profiles } = useProfile();
  const isArabic = i18n.language === 'ar';
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the current profile from the profiles list
  const profile = profiles.find(p => p.id === profileId);
  if (!profile) {
    return null;
  }

  // Get IDs of goals already added to this profile
  const addedGoalIds = new Set(profile.goals?.map(g => g.id) || []);

  const handleGoalSelect = (goalId: string, goalName: string) => {
    // Prevent multiple submissions
    if (isProcessing) {
      console.log('[handleGoalSelect] Already processing, ignoring click');
      return;
    }

    // Validate inputs
    if (!profileId || !goalId) {
      console.error('[handleGoalSelect] Missing required inputs:', { profileId, goalId });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[handleGoalSelect] Starting goal selection:', { profileId, goalId, goalName });
      addGoal(profileId, goalId, goalName);
      console.log('[handleGoalSelect] Goal added successfully, closing modal');
      // Delay close to ensure state updates complete before modal closes
      setTimeout(() => {
        console.log('[handleGoalSelect] Closing modal after goal addition');
        onClose();
        setIsProcessing(false);
      }, 200);
    } catch (error) {
      console.error('[handleGoalSelect] ERROR adding goal:', error);
      // Close modal and reset state even if there's an error
      setTimeout(() => {
        console.error('[handleGoalSelect] Closing modal due to error');
        onClose();
        setIsProcessing(false);
      }, 200);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="absolute inset-0 flex flex-col bg-white overflow-hidden"
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
                    try {
                      e.stopPropagation();
                      if (!isAdded && !isProcessing) {
                        console.log('[goalButton onClick] Attempting to add goal:', goal.id);
                        handleGoalSelect(goal.id, goal.nameEnglish);
                      } else if (isAdded) {
                        console.log('[goalButton onClick] Goal already added, ignoring click');
                      } else if (isProcessing) {
                        console.log('[goalButton onClick] Already processing, ignoring click');
                      }
                    } catch (error) {
                      console.error('[goalButton onClick] Unexpected error:', error);
                      setIsProcessing(false);
                      // Still close the modal even if there's an error
                      onClose();
                    }
                  }}
                  disabled={isAdded || isProcessing}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left
                    ${
                      isAdded || isProcessing
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

export const GoalsModalMenu = memo(GoalsModalMenuComponent);
