import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/contexts/ProfileContext";
import { useGoals } from "@/hooks/useGoals";
import { phaseService } from "@/services/phaseService";
import { getGoalById } from "@/config/goals-data";
import { Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopNavBar } from "@/components/TopNavBar";
import { LearningPath } from "@/components/LearningPath";

const UnitPath = () => {
  const navigate = useNavigate();
  const { profileId, goalId, unitId } = useParams<{
    profileId: string;
    goalId: string;
    unitId: string;
  }>();
  const { currentProfile, profiles } = useProfile();
  const { getGoal } = useGoals();

  // Find the profile
  const profile = profiles.find((p) => p.id === profileId) || currentProfile;

  // Find the goal
  const currentGoal = profile.goals?.find((g) => g.id === goalId);
  const goalConfig = getGoalById(goalId);

  // Find the unit
  const selectedUnit = goalConfig?.units?.find(
    (u) => u.id === Number(unitId)
  );

  // Get phase size
  const phaseSize = currentGoal?.phaseSize || goalConfig?.metadata?.defaultPhaseSize || 5;

  if (!selectedUnit || !goalConfig || !currentGoal) {
    return (
      <div className="min-h-screen bg-gradient-soft islamic-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground mb-4">Unit not found</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Generate phases on-demand
  const phases = phaseService.generatePhasesForUnit(selectedUnit, phaseSize);
  const phaseProgresses = phaseService.initializePhaseProgress(selectedUnit, phaseSize);

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col">
      {/* Top Navigation */}
      <TopNavBar
        onBack={() => navigate(`/goals?profileId=${profileId}&goalId=${goalId}`)}
        achievements={{
          stars: profile.achievements?.stars || 0,
          streak: profile.achievements?.streak || 0,
          recitations: profile.achievements?.recitations || 0,
          goalsCompleted: profile.achievements?.goalsCompleted || 0,
        }}
      />

      {/* Content */}
      <div className="flex-1 container max-w-md mx-auto p-4 pb-8 space-y-6 flex flex-col">

        {/* Unit Header Card */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 border-none text-white rounded-3xl overflow-hidden">
          <CardContent className="p-6 text-left space-y-1">
            <h2 className="text-3xl font-bold">
              {selectedUnit.name}
            </h2>
            <p className="text-lg font-semibold text-white/95">
              {phaseProgresses.length} Phases - {selectedUnit.versesCount} Verses
            </p>
          </CardContent>
        </Card>

        {/* Learning Path */}
        <div className="flex-1 flex flex-col">
          <LearningPath
            unit={selectedUnit}
            phases={phases}
            phaseProgresses={phaseProgresses}
            isInteractive={true}
          />
        </div>

        {/* Achievement Icon */}
        <div className="flex justify-center pt-8 relative z-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
            <Gem className="h-10 w-10 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitPath;
