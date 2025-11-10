import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import { TopNavBar } from "@/components/TopNavBar";
import { GoalHeader } from "@/components/GoalHeader";
import { VerticalProgressBar } from "@/components/VerticalProgressBar";
import { UnitsGrid, Unit } from "@/components/UnitsGrid";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/contexts/ProfileContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import pencilMascot from "@/assets/pencil-mascot.json";

const Goals = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentProfile, profiles, switchProfile } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [hasAppliedUrlParams, setHasAppliedUrlParams] = useState(false);

  // Handle URL parameters - set profile and goal from URL if provided (only once on initial load)
  useEffect(() => {
    if (hasAppliedUrlParams) return; // Only apply once

    const profileId = searchParams.get('profileId');
    const goalId = searchParams.get('goalId');

    // Only process if we have a profileId
    if (profileId) {
      const selectedProfile = profiles.find(p => p.id === profileId);
      if (selectedProfile) {
        // Find and set the goal index if goalId is provided, BEFORE switching
        if (goalId && selectedProfile.goals) {
          const goalIndex = selectedProfile.goals.findIndex(goal => goal.id === goalId);
          // Only set if found, otherwise will default to active goal
          if (goalIndex !== -1) {
            setCurrentGoalIndex(goalIndex);
          }
        }

        switchProfile(profileId);
        setHasAppliedUrlParams(true);
        // Clean up URL parameters so menu switches work properly
        navigate('/goals', { replace: true });
      }
    }
  }, []);

  // Sync currentGoalIndex when profile changes (use active goal if not set from URL)
  useEffect(() => {
    if (!currentProfile.goals || currentProfile.goals.length === 0) return;

    // If we applied URL params, the index is already set - don't override it
    if (hasAppliedUrlParams) return;

    // Find the active goal
    const activeGoalIndex = currentProfile.goals.findIndex(
      goal => goal.name === currentProfile.currentGoal
    );

    if (activeGoalIndex !== -1) {
      setCurrentGoalIndex(activeGoalIndex);
    } else {
      setCurrentGoalIndex(0);
    }
  }, [currentProfile.id, hasAppliedUrlParams]);

  // Sample data for Juz' 30 (last juz of Quran)
  const juz30Surahs: Unit[] = [
    { id: 78, name: "An-Naba", arabicName: "النبأ", status: "completed" },
    { id: 79, name: "An-Nazi'at", arabicName: "النازعات", status: "completed" },
    { id: 80, name: "Abasa", arabicName: "عبس", status: "completed" },
    { id: 81, name: "At-Takwir", arabicName: "التكوير", status: "completed" },
    { id: 82, name: "Al-Infitar", arabicName: "الإنفطار", status: "completed" },
    { id: 83, name: "Al-Mutaffifin", arabicName: "المطففين", status: "completed" },
    { id: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", status: "completed" },
    { id: 85, name: "Al-Buruj", arabicName: "البروج", status: "completed" },
    { id: 86, name: "At-Tariq", arabicName: "الطارق", status: "completed" },
    { id: 87, name: "Al-A'la", arabicName: "الأعلى", status: "completed" },
    { id: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", status: "completed" },
    { id: 89, name: "Al-Fajr", arabicName: "الفجر", status: "completed" },
    { id: 90, name: "Al-Balad", arabicName: "البلد", status: "completed" },
    { id: 91, name: "Ash-Shams", arabicName: "الشمس", status: "completed" },
    { id: 92, name: "Al-Lail", arabicName: "الليل", status: "completed" },
    { id: 93, name: "Ad-Duha", arabicName: "الضحى", status: "completed" },
    { id: 94, name: "Ash-Sharh", arabicName: "الشرح", status: "completed" },
    { id: 95, name: "At-Tin", arabicName: "التين", status: "completed" },
    { id: 96, name: "Al-Alaq", arabicName: "العلق", status: "completed" },
    { id: 97, name: "Al-Qadr", arabicName: "القدر", status: "completed" },
    { id: 98, name: "Al-Bayyinah", arabicName: "البينة", status: "completed" },
    { id: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", status: "completed" },
    { id: 100, name: "Al-Adiyat", arabicName: "العاديات", status: "completed" },
    { id: 101, name: "Al-Qari'ah", arabicName: "القارعة", status: "completed" },
    { id: 102, name: "At-Takathur", arabicName: "التكاثر", status: "completed" },
    { id: 103, name: "Al-Asr", arabicName: "العصر", status: "completed" },
    { id: 104, name: "Al-Humazah", arabicName: "الهمزة", status: "completed" },
    { id: 105, name: "Al-Fil", arabicName: "الفيل", status: "completed" },
    { id: 106, name: "Quraish", arabicName: "قريش", status: "completed" },
    { id: 107, name: "Al-Ma'un", arabicName: "الماعون", status: "completed" },
    { id: 108, name: "Al-Kawthar", arabicName: "الكوثر", status: "completed" },
    { id: 109, name: "Al-Kafirun", arabicName: "الكافرون", status: "completed" },
    { id: 110, name: "An-Nasr", arabicName: "النصر", status: "completed" },
    { id: 111, name: "Al-Masad", arabicName: "المسد", status: "completed" },
    { id: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", status: "completed" },
    { id: 113, name: "Al-Falaq", arabicName: "الفلق", status: "completed" },
    { id: 114, name: "An-Nas", arabicName: "الناس", status: "completed" },
  ];

  // Sample data for Juz' 29 (Tabaarak) - 11 Surahs
  const juz29Surahs: Unit[] = [
    { id: 67, name: "Al-Mulk", arabicName: "الملك", status: "completed" },
    { id: 68, name: "Al-Qalam", arabicName: "القلم", status: "completed" },
    { id: 69, name: "Al-Haqqah", arabicName: "الحاقة", status: "completed" },
    { id: 70, name: "Al-Ma'arij", arabicName: "المعارج", status: "completed" },
    { id: 71, name: "Nuh", arabicName: "نوح", status: "completed" },
    { id: 72, name: "Al-Jinn", arabicName: "الجن", status: "completed" },
    { id: 73, name: "Al-Muzzammil", arabicName: "المزمل", status: "in-progress" },
    { id: 74, name: "Al-Muddathir", arabicName: "المدثر", status: "not-started" },
    { id: 75, name: "Al-Qiyamah", arabicName: "القيامة", status: "not-started" },
    { id: 76, name: "Al-Insan", arabicName: "الإنسان", status: "not-started" },
    { id: 77, name: "Al-Mursalat", arabicName: "المرسلات", status: "not-started" },
  ];

  // Get achievements directly from current profile
  const stars = currentProfile.achievements?.stars || 0;
  const streak = currentProfile.achievements?.streak || 0;
  const recitations = currentProfile.achievements?.recitations || 0;
  const goalsCompleted = currentProfile.achievements?.goalsCompleted || 0;

  const handleUnitClick = (unit: Unit) => {
    toast({
      title: `Opening ${unit.name}`,
      description: `Let's learn ${unit.arabicName}!`,
    });
  };

  // Check if user has goals
  const hasGoals = currentProfile.goalsCount && currentProfile.goalsCount > 0;

  // Generate unit statuses based on learner's progress
  const generateUnitsWithProgress = (units: Unit[], completedCount: number, totalCount: number) => {
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
    if (goals.length === 0) return null;

    const goal = goals[currentGoalIndex % goals.length];
    const completedCount = goal.completedSurahs || 0;
    const totalCount = goal.totalSurahs || 0;

    switch (goal.name) {
      case "Juz' 29":
        return {
          name: "Juz' 29",
          surahCount: 11,
          ayatCount: 447,
          units: generateUnitsWithProgress(juz29Surahs, completedCount, totalCount),
          totalUnits: 11,
          goalId: goal.id
        };
      case "Juz' 30":
        return {
          name: "Juz' 30",
          surahCount: 37,
          ayatCount: 564,
          units: generateUnitsWithProgress(juz30Surahs, completedCount, totalCount),
          totalUnits: 37,
          goalId: goal.id
        };
      default:
        return null;
    }
  };

  const goalData = getGoalData();
  const hasMultipleGoals = currentProfile.goals && currentProfile.goals.length > 1;

  const handlePrevGoal = () => {
    if (currentProfile.goals && currentProfile.goals.length > 0) {
      setCurrentGoalIndex((prev) => (prev - 1 + currentProfile.goals!.length) % currentProfile.goals!.length);
    }
  };

  const handleNextGoal = () => {
    if (currentProfile.goals && currentProfile.goals.length > 0) {
      setCurrentGoalIndex((prev) => (prev + 1) % currentProfile.goals!.length);
    }
  };

  // Calculate completed count dynamically from goal data
  const completedCount = goalData ? goalData.units.filter(unit => unit.status === "completed").length : 0;

  // Find in-progress unit and calculate its position
  const inProgressUnitIndex = goalData ? goalData.units.findIndex(unit => unit.status === "in-progress") : -1;
  const columnsPerRow = 4;
  const unitRow = Math.floor(inProgressUnitIndex / columnsPerRow);
  const unitColumn = inProgressUnitIndex % columnsPerRow;

  // Calculate mascot position (each unit ~80px + 8px gap)
  const mascotTop = unitRow * 88;
  const isLastColumn = unitColumn === 3;

  // Position mascot on the right for columns 0-2, on the left for column 3
  const mascotPositioning = isLastColumn
    ? { right: '10%' }  // Position on the left side when in last column
    : { left: `calc(${unitColumn * 25 + 10}% + 0.375rem)` };  // Position on the right for other columns

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
                  <CardTitle className="text-2xl">Start Your Journey</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Select your first learning goal
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Begin your journey of Quranic learning and earn rewards as you progress
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Choose a goal:
                  </label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juz-30">Juz' 30</SelectItem>
                      <SelectItem value="juz-29">Juz' 29</SelectItem>
                      <SelectItem value="surah-bakarah">Surah Al Bakarah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  onClick={() => selectedGoal && navigate("/goals")}
                  disabled={!selectedGoal}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Start Learning
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

                {/* Pencil Mascot - Positioned dynamically on in-progress unit */}
                {inProgressUnitIndex !== -1 && (
                  <div
                    className="absolute w-36 h-36 pointer-events-none z-10"
                    style={{
                      ...mascotPositioning,
                      top: `${mascotTop}px`
                    }}
                  >
                    <Lottie animationData={pencilMascot} loop={true} />
                  </div>
                )}
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
                  aria-label="Previous goal"
                >
                  <ChevronLeft className="h-7 w-7" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextGoal}
                  className="h-14 w-14 rounded-full border-2 border-foreground/50 hover:border-primary hover:bg-primary/10 transition-all"
                  aria-label="Next goal"
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
