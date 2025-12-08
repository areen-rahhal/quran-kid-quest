import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { ChevronLeft, UserPlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "@/components/ProfileCard";
import { ChildProfileForm } from "@/components/ChildProfileForm";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/lib/validation";

const LearnersProfiles = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profiles, currentParentId } = useProfile();

  // Sort profiles by streak (descending) - most active first
  const sortedProfiles = [...profiles].sort((a, b) => {
    const streakA = a.streak || 0;
    const streakB = b.streak || 0;
    return streakB - streakA;
  });

  const handleNavigateToProfile = (profileId: string) => {
    navigate(`/learner/${profileId}`);
  };

  const handleAddGoal = (profileId: string) => {
    navigate(`/goals?profileId=${profileId}`);
  };

  const handleGoalClick = (profileId: string, goalId: string) => {
    navigate(`/goals?profileId=${profileId}&goalId=${goalId}`);
  };

  const handleAddLearner = () => {
    // TODO: Navigate to add learner page
    console.log('Add new learner');
  };

  const handleAddChildProfile = () => {
    navigate('/add-child-profile');
  };

  // Separate parent and child profiles
  const parentProfile = profiles.find(p => p.type === 'parent');
  const childProfiles = profiles.filter(p => p.type === 'child');
  const canAddMoreChildren = childProfiles.length < 3;

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
              <h1 className="text-2xl font-bold text-foreground">{t('learnersProfiles.title')}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 pb-8 space-y-6 flex-1">
        {/* Parent Profile Section */}
        {parentProfile && (
          <div className="space-y-3">
            <ProfileCard
              profile={parentProfile}
              onNavigate={handleNavigateToProfile}
              onAddGoal={handleAddGoal}
              onGoalClick={handleGoalClick}
            />
          </div>
        )}

        {/* Child Profiles Section */}
        {childProfiles.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Childs</h2>
            <div className="space-y-2">
              {childProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onNavigate={handleNavigateToProfile}
                  onAddGoal={handleAddGoal}
                  onGoalClick={handleGoalClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Child Profile Card - Show if less than 3 children */}
        {canAddMoreChildren && !showChildForm && (
          <Card
            className="p-6 border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group"
            onClick={() => setShowChildForm(true)}
          >
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">Add Child Profile.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Child Profile Form - Show when clicked */}
        {showChildForm && (
          <Card className="p-6 bg-card border-2 border-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{t('learnersProfiles.createNewChild')}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChildForm(false)}
                disabled={isCreatingChild}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ChildProfileForm
              onSubmit={handleCreateChildProfile}
              onCancel={() => setShowChildForm(false)}
              isLoading={isCreatingChild}
            />
          </Card>
        )}

        {/* Max Children Reached Message */}
        {!canAddMoreChildren && (
          <Card className="p-4 bg-accent/50 border border-primary/30">
            <p className="text-sm text-foreground text-center">
              {t('learnersProfiles.maxChildrenReached')}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LearnersProfiles;
