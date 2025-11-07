import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/contexts/ProfileContext";
import { Star, Flame, Gem, Trophy, Plus, Pencil, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const LearnersProfiles = () => {
  const navigate = useNavigate();
  const { profiles } = useProfile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock achievements - in real app this would come from profile data
  const mockAchievements = {
    stars: 128,
    streak: 7,
    gems: 45,
    trophies: 1,
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Learners Profiles</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="p-6 space-y-4">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-border">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.name} />
                    ) : (
                      getInitials(profile.name)
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold text-foreground">
                      {profile.name}
                    </span>
                    <span className="text-muted-foreground">.</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs capitalize"
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
              >
                <Pencil className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Achievements (only for parent) */}
            {profile.type === 'parent' && (
              <Card className="p-4 bg-muted/30 border-0">
                <div className="flex items-center justify-around">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent fill-accent" />
                    <span className="font-semibold text-foreground">{mockAchievements.stars}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-foreground">{mockAchievements.streak}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-secondary" />
                    <span className="font-semibold text-foreground">{mockAchievements.gems}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-foreground">{mockAchievements.trophies}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Goals (only for child) */}
            {profile.type === 'child' && profile.goalsCount > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Goals</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.currentGoal && (
                    <Badge 
                      variant="outline" 
                      className="px-4 py-2 text-base border-2 border-border bg-background hover:bg-accent cursor-default"
                    >
                      {profile.currentGoal}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full border-2 hover:bg-accent hover:border-primary/50"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LearnersProfiles;
