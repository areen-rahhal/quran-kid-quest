import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/contexts/ProfileContext";
import { Plus, ChevronLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/ProfileCard";

const LearnersProfiles = () => {
  const navigate = useNavigate();
  const { profiles } = useProfile();

  const handleEditProfile = (profileId: string) => {
    // TODO: Navigate to edit profile page
    console.log('Edit profile:', profileId);
  };

  const handleAddGoal = (profileId: string) => {
    // TODO: Navigate to add goal page
    console.log('Add goal for profile:', profileId);
  };

  const handleAddLearner = () => {
    // TODO: Navigate to add learner page
    console.log('Add new learner');
  };

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10 shadow-soft">
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
      <div className="container max-w-2xl mx-auto p-4 pb-8 space-y-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onEdit={handleEditProfile}
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
