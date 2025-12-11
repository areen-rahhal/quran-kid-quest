import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { GOALS_DATABASE } from '@/config/goals-data';
import { Goal } from '@/types/goals';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  returnTo?: string;
}

export const AddGoalModal = ({
  isOpen,
  onClose,
  profileId,
  returnTo,
}: AddGoalModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { addGoal, profiles } = useProfile();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the profile to find existing goals
  const profile = profiles.find(p => p.id === profileId);
  const existingGoalIds = new Set(profile?.goals?.map(g => g.id) || []);

  // Filter available goals (exclude existing ones)
  const availableGoals = GOALS_DATABASE.filter(
    goal => !existingGoalIds.has(goal.id)
  );

  // Reset selection when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedGoalId(null);
    }
  }, [isOpen]);

  const getGoalDisplayName = (goal: Goal): string => {
    return t(`goals.${goal.id}`, goal.nameEnglish) || goal.nameEnglish;
  };

  const getDifficultyBadgeColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'short':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'long':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
  };

  const handleAddGoal = async () => {
    if (!selectedGoalId || !profileId) {
      toast({
        title: t('learnersProfiles.error', 'Error'),
        description: t('learnersProfiles.errorSelectGoal', 'Please select a goal'),
        variant: 'destructive',
      });
      return;
    }

    const selectedGoal = GOALS_DATABASE.find(g => g.id === selectedGoalId);
    if (!selectedGoal) {
      toast({
        title: t('learnersProfiles.error', 'Error'),
        description: t('learnersProfiles.goalNotFound', 'Goal not found'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const goalName = getGoalDisplayName(selectedGoal);
      await addGoal(profileId, selectedGoalId, goalName);

      toast({
        title: t('learnersProfiles.goalAdded', 'Goal Added'),
        description: `${goalName} ${t('learnersProfiles.addedSuccessfully', 'added to your learning plan')}`,
      });

      onClose();

      // Navigate if returnTo is provided
      if (returnTo) {
        const url = new URL(returnTo, window.location.origin);
        window.location.href = url.toString();
      }
    } catch (error) {
      console.error('[AddGoalModal] Error adding goal:', error);
      toast({
        title: t('learnersProfiles.error', 'Error'),
        description: t('learnersProfiles.errorAddingGoal', 'Failed to add goal. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedGoal = GOALS_DATABASE.find(g => g.id === selectedGoalId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <SheetHeader className="flex-shrink-0 border-b border-border pb-4">
          <SheetTitle>{t('learnersProfiles.selectGoal', 'Select a Goal')}</SheetTitle>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {availableGoals.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-center">
                {t('learnersProfiles.noAvailableGoals', 'All goals have been added')}
              </p>
            </div>
          ) : (
            <div className="space-y-2 px-1">
              {availableGoals.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => handleSelectGoal(goal.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                    disabled={isLoading}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`${getGoalDisplayName(goal)}, ${goal.metadata.surahCount} surahs, ${goal.metadata.versesCount} verses`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">
                            {getGoalDisplayName(goal)}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDifficultyBadgeColor(goal.metadata.difficulty)}`}
                          >
                            {t(`goals.difficulty.${goal.metadata.difficulty}`, goal.metadata.difficulty)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t('goals.surahCount', 'Surahs')}: {goal.metadata.surahCount} •{' '}
                          {t('goals.ayatCount', 'Ayat')}: {goal.metadata.versesCount}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <SheetFooter className="flex-shrink-0 border-t border-border pt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:flex-1"
          >
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleAddGoal}
            disabled={!selectedGoal || isLoading}
            className="sm:flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('learnersProfiles.adding', 'Adding...')}
              </>
            ) : (
              t('learnersProfiles.addGoal', 'Add Goal')
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
