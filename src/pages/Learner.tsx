import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { LearnerProfileForm } from "@/components/LearnerProfileForm";
import { ChevronLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Learner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { profiles } = useProfile();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const profile = profiles.find((p) => p.id === id);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-soft islamic-pattern flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-4">Learner not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft islamic-pattern">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10 shadow-soft">
        <div className="container max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              {t('learnersProfiles.editProfile') || 'Edit Profile'}
            </h1>
            <div className="w-10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 pb-8">
        <LearnerProfileForm profile={profile} />
      </div>
    </div>
  );
};

export default Learner;
