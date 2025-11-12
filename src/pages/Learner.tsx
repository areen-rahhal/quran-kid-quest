import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/contexts/ProfileContext";
import { LearnerProfileForm } from "@/components/LearnerProfileForm";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Learner = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { profiles } = useProfile();

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
            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 pb-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Learner profile details coming soon...</p>
        </Card>
      </div>
    </div>
  );
};

export default Learner;
