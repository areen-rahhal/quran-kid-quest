import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/contexts/ProfileContext";
import { ChevronLeft, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/ProfileCard";
import { useState } from "react";

const LearnersProfiles = () => {
  const navigate = useNavigate();
  const { profiles } = useProfile();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sort profiles by streak (descending) - most active first
  const sortedProfiles = [...profiles].sort((a, b) => {
    const streakA = a.streak || 0;
    const streakB = b.streak || 0;
    return streakB - streakA;
  });

  // Update Zain's profile with cat avatar
  const profilesWithCatAvatar = sortedProfiles.map((profile) => {
    if (profile.id === '3') {
      return {
        ...profile,
        avatar: 'https://cdn.builder.io/api/v1/image/assets%2F8575fa54a5454f989a158bbc14ee390c%2Fa3cffb81fbde4015ad8bedfb2e19a16e?format=webp&width=800',
      };
    }
    return profile;
  });

  const handleNavigateToProfile = (profileId: string) => {
    navigate(`/learner/${profileId}`);
  };

  const handleAddGoal = (profileId: string) => {
    // TODO: Navigate to add goal page
    console.log('Add goal for profile:', profileId);
  };

  const handleAddLearner = () => {
    // TODO: Navigate to add learner page
    console.log('Add new learner');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-soft">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-10 w-10"
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 pb-8 space-y-4 flex-1">
        {profilesWithCatAvatar.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onNavigate={handleNavigateToProfile}
            onAddGoal={handleAddGoal}
          />
        ))}

        {/* Add New Learner Card */}
        <Card
          className="p-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group"
          onClick={handleAddLearner}
        >
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">Add New Learner</p>
              <p className="text-sm text-muted-foreground">Create a profile for another child</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LearnersProfiles;
