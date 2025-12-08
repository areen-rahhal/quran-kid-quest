import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TopNavBar } from "@/components/TopNavBar";
import { GoalHeader } from "@/components/GoalHeader";
import { VerticalProgressBar } from "@/components/VerticalProgressBar";
import { UnitsGrid, Unit } from "@/components/UnitsGrid";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useGoals } from "@/hooks/useGoals";
import { BaseUnit } from "@/types/goals";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Goals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { currentProfile, profiles, switchProfile, addGoal, isLoading } = useProfile();
  const { allGoals, getGoal } = useGoals();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [hasAppliedUrlParams, setHasAppliedUrlParams] = useState(false);

  // Handle URL parameters - set profile and goal from URL if provided (only once on initial load)
  useEffect(() => {
    // Wait until profiles are loaded
    if (isLoading || profiles.length === 0) {
      return;
    }

    if (hasAppliedUrlParams) {
      return;
    }

    const profileId = searchParams.get('profileId');
    const goalId = searchParams.get('goalId');

    // Determine which profile to use
    let selectedProfileId = profileId;

    // If no profileId provided, default to parent profile
    if (!selectedProfileId) {
      const parentProfile = profiles.find(p => p.type === 'parent');
      selectedProfileId = parentProfile?.id;
    }

    // Only process if we have a profileId
    if (selectedProfileId) {
      const selectedProfile = profiles.find(p => p.id === selectedProfileId);

      if (selectedProfile) {
        // Find and set the goal index if goalId is provided, BEFORE switching
        if (goalId && selectedProfile.goals) {
          const goalIndex = selectedProfile.goals.findIndex(goal => goal.id === goalId);

          // Only set if found, otherwise will default to active goal
          if (goalIndex !== -1) {
            setCurrentGoalIndex(goalIndex);
          }
        }

        console.log('[Goals] Switching to profile:', selectedProfileId, selectedProfile.name, selectedProfile.type);
        switchProfile(selectedProfileId);
        setHasAppliedUrlParams(true);

        // Clean up URL parameters so menu switches work properly
        navigate('/goals', { replace: true });
      }
    }
  }, [isLoading, profiles]);

  // Sync currentGoalIndex when profile changes (use active goal if not set from URL)
  useEffect(() => {
    // Safety check: ensure currentProfile and goals exist
    if (!currentProfile?.id || !currentProfile?.goals || currentProfile.goals.length === 0) {
      return;
    }

    // Check if URL params exist (more reliable than the flag due to state batching)
    const hasUrlGoalId = searchParams.get('goalId');
    if (hasUrlGoalId || hasAppliedUrlParams) {
      return;
    }

    // Find the active goal
    const activeGoalIndex = currentProfile.goals.findIndex(
      goal => goal.name === currentProfile.currentGoal
    );

    if (activeGoalIndex !== -1) {
      setCurrentGoalIndex(activeGoalIndex);
    } else {
      setCurrentGoalIndex(0);
    }
  }, [currentProfile.id, hasAppliedUrlParams, searchParams]);


  // Get achievements directly from current profile
  const stars = currentProfile.achievements?.stars || 0;
  const streak = currentProfile.achievements?.streak || 0;
  const recitations = currentProfile.achievements?.recitations || 0;
  const goalsCompleted = currentProfile.achievements?.goalsCompleted || 0;

  const handleUnitClick = (unit: Unit) => {
    if (!currentProfile?.id) {
      console.warn('[handleUnitClick] currentProfile not properly initialized');
      return;
    }
    const currentGoal = currentProfile.goals?.[currentGoalIndex];
    if (currentGoal) {
      navigate(`/unit-path/${currentProfile.id}/${currentGoal.id}/${unit.id}`);
    }
  };

  // Check if user has goals
  const hasGoals = currentProfile.goalsCount && currentProfile.goalsCount > 0;

  // Generate unit statuses based on learner's progress
  const generateUnitsWithProgress = (units: BaseUnit[], completedCount: number, totalCount: number): Unit[] => {
    return units.map((unit, index) => {
      if (index < completedCount) {
        return { ...unit, status: "completed" as const };
      } else if (index === completedCount) {
        return { ...unit, status: "in-progress" as const };
      } else {
        return { ...unit, status: "not-started" as const };
      }
    });
  };

  // Get the goal to display based on currentGoalIndex
  const getGoalData = () => {
    const goals = currentProfile.goals || [];

    if (goals.length === 0) {
      return null;
    }

    const goalProgress = goals[currentGoalIndex % goals.length];
    const configGoal = getGoal(goalProgress.id);

    if (!configGoal) {
      return null;
    }

    const completedCount = goalProgress.completedSurahs || 0;
    const totalCount = goalProgress.totalSurahs || 0;
    const unitsWithProgress = generateUnitsWithProgress(
      configGoal.units,
      completedCount,
      totalCount
    );

    return {
      name: configGoal.nameEnglish,
      surahCount: configGoal.metadata.surahCount,
      ayatCount: configGoal.metadata.versesCount,
      units: unitsWithProgress,
      totalUnits: configGoal.units.length,
      goalId: goalProgress.id
    };
  };

  const goalData = getGoalData();
  const hasMultipleGoals = currentProfile.goals && currentProfile.goals.length > 1;


  const handlePrevGoal = () => {
    const goals = currentProfile?.goals;
    if (goals && goals.length > 0) {
      setCurrentGoalIndex((prev) => (prev - 1 + goals.length) % goals.length);
    }
  };

  const handleNextGoal = () => {
    const goals = currentProfile?.goals;
    if (goals && goals.length > 0) {
      setCurrentGoalIndex((prev) => (prev + 1) % goals.length);
    }
  };

  // Calculate completed count dynamically from goal data
  const completedCount = goalData ? goalData.units.filter(unit => unit.status === "completed").length : 0;

  // If no goals, show empty state
  if (!hasGoals) {
    return (
      <div className="min-h-screen bg-gradient-soft islamic-pattern">
        <TopNavBar
          achievements={{
            stars: 0,
            streak: 0,
            recitations: 0,
            goalsCompleted: 0
          }}
        />
        <div className="container max-w-md mx-auto p-4 pb-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md transition-all border-2 hover:border-secondary hover:shadow-strong">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{t('goals.startJourney')}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {t('goals.selectGoal')}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t('goals.beginJourney')}
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    {t('goals.chooseGoal')}
                  </label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('goals.chooseGoalLabel')} />
                    </SelectTrigger>
                    <SelectContent>
                      {allGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.nameEnglish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => {
                    if (!currentProfile?.id) {
                      console.error('[addGoal] currentProfile is not properly initialized');
                      toast({
                        title: 'Error',
                        description: 'Profile not loaded. Please refresh the page.',
                      });
                      return;
                    }
                    if (selectedGoal) {
                      const goal = getGoal(selectedGoal);
                      if (goal) {
                        addGoal(currentProfile.id, selectedGoal, goal.nameEnglish);
                        toast({
                          title: t('goals.goalAdded'),
                          description: `${goal.nameEnglish} has been added to your learning plan`,
                        });
                      }
                    }
                  }}
                  disabled={!selectedGoal}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t('goals.startLearning')}
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern">
      <TopNavBar
        achievements={{
          stars,
          streak,
          recitations,
          goalsCompleted
        }}
      />
      <div className="container max-w-md mx-auto p-4 pb-8">
        {goalData && (
          <>
            <GoalHeader
              goalName={goalData.name}
              surahCount={goalData.surahCount}
              ayatCount={goalData.ayatCount}
            />

            {/* Progress bar and units grid side by side */}
            <div className="flex gap-3 relative">
              <VerticalProgressBar
                completed={completedCount}
                total={goalData.totalUnits}
              />

              <div className="flex-1 relative">
                <UnitsGrid
                  units={goalData.units}
                  onUnitClick={handleUnitClick}
                />

              </div>
            </div>

            {/* Goal Navigation - Prev/Next Buttons */}
            {hasMultipleGoals && (
              <div className="flex items-center justify-center gap-12 mt-12 pt-6 border-t border-border/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevGoal}
                  className="h-14 w-14 rounded-full border-2 border-foreground/50 hover:border-primary hover:bg-primary/10 transition-all"
                  aria-label={t('goals.previousGoal')}
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextGoal}
                  className="h-14 w-14 rounded-full border-2 border-foreground/50 hover:border-primary hover:bg-primary/10 transition-all"
                  aria-label={t('goals.nextGoal')}
                >
                  <ChevronRight className="h-7 w-7" />
                </Button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Goals;
