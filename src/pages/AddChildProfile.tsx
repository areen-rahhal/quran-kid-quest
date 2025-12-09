import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChildProfileForm } from "@/components/ChildProfileForm";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/lib/validation";

const AddChildProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { createChildProfile } = useProfile();
  const { toast } = useToast();
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  const handleCreateChildProfile = async (childData: Omit<Profile, 'id'>) => {
    setIsCreatingChild(true);
    try {
      const newChild = await createChildProfile(childData);
      if (newChild) {
        toast({
          title: t('learnersProfiles.childCreated'),
          description: t('learnersProfiles.childCreatedDesc'),
        });
        navigate('/learners-profiles');
      } else {
        toast({
          title: t('common.error'),
          description: t('learnersProfiles.failedToCreateChild'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating child profile:', error);
      toast({
        title: t('common.error'),
        description: t('learnersProfiles.failedToCreateChild'),
        variant: 'destructive',
      });
    } finally {
      setIsCreatingChild(false);
    }
  };

  const handleCancel = () => {
    navigate('/learners-profiles');
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
                onClick={() => navigate('/learners-profiles')}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">{t('learnersProfiles.addChildProfile') || 'Add Child Profile'}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl mx-auto p-4 pb-8 flex-1">
        <Card className="p-6 bg-card border border-border">
          <ChildProfileForm
            onSubmit={handleCreateChildProfile}
            onCancel={handleCancel}
            isLoading={isCreatingChild}
          />
        </Card>
      </div>
    </div>
  );
};

export default AddChildProfile;
