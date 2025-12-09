import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Target, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { AVATAR_OPTIONS } from "@/utils/avatars";
import { getGoalById, getAllGoals } from "@/config/goals-data";

const Onboarding = () => {
  const navigate = useNavigate();
  const { parentProfile, currentProfile, addGoal, isLoading } = useProfile();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  // Check if profile is valid (not the default 'unknown' placeholder)
  const isProfileValid = currentProfile && currentProfile.id !== 'unknown';

  // Allow goal addition if profile is valid, even if background refresh is happening
  // isLoading only blocks goal addition if we truly don't have cached data yet
  const canAddGoal = isProfileValid && !isAddingGoal;

  const handleLogout = () => {
    navigate("/");
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 islamic-pattern" />

      {/* Parent Profile Header */}
      <div className="relative z-10 mb-8">
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-border">
          <div
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/learner/${currentProfile.id}`)}
            title="View profile"
          >
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                {getInitials(parentProfile?.name || currentProfile?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Welcome {parentProfile?.name || currentProfile?.name || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-foreground">Welcome to Your Quran Journey</h1>
            <p className="text-lg text-muted-foreground">Choose how you'd like to get started</p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start Learning Card */}
            <Card className="transition-all border-2 hover:border-secondary hover:shadow-strong">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Start Learning</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Set your personal learning goal
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Begin your own journey of Quranic knowledge
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select your first goal:
                  </label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllGoals().map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.nameEnglish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={async () => {
                    if (!selectedGoal || !canAddGoal) {
                      console.warn('Cannot add goal:', { selectedGoal, canAddGoal, isProfileValid });
                      return;
                    }

                    setIsAddingGoal(true);
                    try {
                      if (!isProfileValid) {
                        console.error("Profile is not valid yet. Waiting for profiles to load.");
                        return;
                      }

                      const goalConfig = getGoalById(selectedGoal);
                      if (!goalConfig) {
                        console.error("Goal not found:", selectedGoal);
                        return;
                      }

                      await addGoal(
                        currentProfile.id,
                        selectedGoal,
                        goalConfig.nameEnglish
                      );

                      navigate("/goals");
                    } catch (error) {
                      console.error("Error adding goal:", error);
                    } finally {
                      setIsAddingGoal(false);
                    }
                  }}
                  disabled={!selectedGoal || !canAddGoal}
                  className="w-full bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90"
                >
                  {isAddingGoal ? "Adding Goal..." : "Continue"}
                </Button>
              </CardContent>
            </Card>

            {/* Add Child Profile Card */}
            <Card
              className="cursor-pointer transition-all hover:shadow-strong hover:scale-105 border-2 hover:border-primary"
              onClick={() => navigate("/goals")}
            >
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center">
                  <UserPlus className="w-10 h-10 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Add Child Profile</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Create a learning profile for your child
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Track their progress and customize their learning experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
