import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pencil, Plus } from "lucide-react";
import { AchievementsRow } from "./AchievementsRow";
import { Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile;
  onEdit?: (profileId: string) => void;
  onAddGoal?: (profileId: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Mock data - in real app this would come from profile data
const mockAchievements = {
  stars: 128,
  streak: 7,
  recitations: 45,
  goalsCompleted: 1,
};

// Mock progress data - in real app this would come from profile data
const mockProgress = {
  completed: 4,
  total: 37,
  currentGoal: "Juz' 30"
};

export const ProfileCard = ({ profile, onEdit, onAddGoal }: ProfileCardProps) => {
  const progressPercentage = mockProgress.total > 0
    ? (mockProgress.completed / mockProgress.total) * 100
    : 0;

  // Check if profile has active goals
  const hasActiveGoals = profile.currentGoal || profile.goalsCount > 0;

  return (
    <Card className="p-6 space-y-4 transition-all hover:shadow-medium">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-border">
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                getInitials(profile.name)
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">
                {profile.name}
              </span>
              <span className="text-muted-foreground">·</span>
              <Badge
                variant="secondary"
                className="text-xs capitalize font-medium"
              >
                {profile.type}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 hover:bg-accent"
          onClick={() => onEdit?.(profile.id)}
        >
          <Pencil className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Achievements (for any profile with active goals) */}
      {hasActiveGoals && (
        <div className="pt-2">
          <AchievementsRow
            stars={mockAchievements.stars}
            streak={mockAchievements.streak}
            recitations={mockAchievements.recitations}
            goalsCompleted={mockAchievements.goalsCompleted}
          />
        </div>
      )}

      {/* Goals Section (for all profile types) */}
      <div className="space-y-2">
        {profile.currentGoal ? (
          <>
            {/* Goal Header */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-foreground">Current Goal</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => onAddGoal?.(profile.id)}
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs">Add Goal</span>
              </Button>
            </div>

            {/* Minimal Goal Card */}
            <Card className="p-3 bg-gradient-soft border border-border hover:border-primary/30 transition-all cursor-pointer">
              <div className="space-y-1.5">
                {/* Goal Name and Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {profile.currentGoal}
                  </span>
                  <Badge variant="outline" className="text-xs font-semibold border-success text-success bg-success/10 flex-shrink-0">
                    In Progress
                  </Badge>
                </div>

                {/* Thin Progress Bar */}
                <Progress value={progressPercentage} className="h-1.5" />
              </div>
            </Card>
          </>
        ) : (
          // Empty state - prominent Add Goal button for any profile without goals
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No goals yet</p>
            <Button
              variant="outline"
              className="gap-2 border-2 hover:border-primary/50 hover:bg-accent"
              onClick={() => onAddGoal?.(profile.id)}
            >
              <Plus className="h-4 w-4" />
              Add First Goal
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
