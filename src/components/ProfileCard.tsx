import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { AchievementsRow } from "./AchievementsRow";
import { AvatarImage } from "./AvatarImage";
import { Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile;
  onNavigate?: (profileId: string) => void;
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

export const ProfileCard = ({ profile, onNavigate, onAddGoal }: ProfileCardProps) => {
  const progressPercentage = mockProgress.total > 0
    ? (mockProgress.completed / mockProgress.total) * 100
    : 0;

  // Check if profile has active goals
  const hasActiveGoals = profile.currentGoal || profile.goalsCount > 0;

  return (
    <Card
      className="p-6 space-y-4 transition-all hover:shadow-medium cursor-pointer"
      onClick={() => onNavigate?.(profile.id)}
    >
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-[2.5px] border-border shadow-medium ring-2 ring-border/20 hover:shadow-strong hover:ring-border/40 transition-all duration-200">
          {profile.avatar && profile.avatar.startsWith('http') ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover object-center antialiased transition-transform duration-300 hover:scale-105"
              style={{
                imageRendering: 'smooth',
                WebkitFontSmoothing: 'antialiased',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
            />
          ) : (
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">
              {getInitials(profile.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              {profile.name}
            </span>
            <span className="text-muted-foreground">·</span>
            <Badge
              variant="outline"
              className="text-xs capitalize font-medium border-muted-foreground/30 text-muted-foreground"
            >
              {profile.type}
            </Badge>
          </div>
        </div>
      </div>

      {/* Achievements (for any profile with active goals) */}
      {hasActiveGoals && (
        <div className="pt-1">
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
        {profile.goals && profile.goals.length > 0 ? (
          <>
            {/* Goal Label */}
            <label className="text-sm font-semibold text-foreground block">Goals</label>

            {/* Goals List with Add Button */}
            <div className="grid grid-cols-3 gap-2">
              {profile.goals.map((goal) => (
                <Card key={goal.id} className="p-2 bg-gradient-soft border border-border hover:border-primary/30 transition-all cursor-pointer">
                  <div className="space-y-0.5">
                    {/* Goal Name */}
                    <span className="text-xs font-semibold text-foreground block line-clamp-1">
                      {goal.name}
                    </span>

                    {/* Progress Bar */}
                    {goal.totalSurahs && goal.totalSurahs > 0 && (
                      <Progress
                        value={goal.completedSurahs ? (goal.completedSurahs / goal.totalSurahs) * 100 : 0}
                        className="h-1.5"
                      />
                    )}
                  </div>
                </Card>
              ))}

              {/* Add Goal Button */}
              <Button
                size="icon"
                className="h-auto aspect-square bg-primary/10 text-primary hover:bg-primary/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGoal?.(profile.id);
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          // Empty state - compact for parent without goals
          <div className={`text-center ${profile.type === 'parent' ? 'py-3' : 'py-6'}`}>
            {profile.type === 'parent' && (
              <p className="text-xs text-muted-foreground mb-2">Set up the first goal to begin learning</p>
            )}
            <Button
              variant="outline"
              className="gap-2 border-2 hover:border-primary/50 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onAddGoal?.(profile.id);
              }}
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
