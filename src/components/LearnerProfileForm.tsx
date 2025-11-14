import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/contexts/ProfileContext';
import { useGoals } from '@/hooks/useGoals';
import { GoalsModalMenu } from './GoalsModalMenu';
import { AvatarSelectionModal } from './AvatarSelectionModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Profile } from '@/types/profile';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { getAvatarImageUrl } from '@/utils/avatars';

interface LearnerProfileFormProps {
  profile: Profile;
}

export const LearnerProfileForm = ({ profile }: LearnerProfileFormProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateProfile, deleteGoal } = useProfile();
  const { getGoal } = useGoals();

  const [nickname, setNickname] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || 'avatar-waleed');
  const [dob, setDob] = useState(profile.age ? new Date(new Date().getFullYear() - profile.age, 0, 1).toISOString().split('T')[0] : '');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);

  const handleSave = () => {
    const age = dob ? new Date().getFullYear() - new Date(dob).getFullYear() : undefined;

    updateProfile(profile.id, {
      name: nickname,
      avatar: selectedAvatar,
      age: age,
    });

    // Navigate back to learners profiles screen
    navigate('/learners-profiles');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoal(profile.id, goalToDelete);
      setGoalToDelete(null);
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const displayAge = calculateAge(dob);

  return (
    <div className="space-y-6">
      {/* Nickname */}
      <Card className="p-6 space-y-3">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            {t('learnersProfiles.nickname') || 'Nickname'}
          </label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
            className="text-base"
          />
        </div>
      </Card>

      {/* Avatar Selection */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground block">
            {t('learnersProfiles.avatar') || 'Avatar'}
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAvatarModalOpen(true)}
            className="gap-1"
          >
            <Pencil className="w-4 h-4" />
            {t('learnersProfiles.changeAvatar') || 'Change'}
          </Button>
        </div>
        <div className="flex justify-center">
          <img
            src={getAvatarImageUrl(selectedAvatar)}
            alt="Selected Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
      </Card>

      {/* Age / DOB */}
      <Card className="p-6 space-y-3">
        <div>
          <label className="text-sm font-semibold text-foreground block mb-2">
            {t('learnersProfiles.dateOfBirth') || 'Date of Birth'}
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
          {displayAge !== null && (
            <p className="text-sm text-muted-foreground mt-2">
              {t('learnersProfiles.age') || 'Age'}: {displayAge} {displayAge === 1 ? 'year' : 'years'}
            </p>
          )}
        </div>
      </Card>

      {/* Current Goals */}
      {profile.goals && profile.goals.length > 0 && (
        <Card className="p-6 space-y-4">
          <label className="text-sm font-semibold text-foreground block">
            {t('learnersProfiles.goalsLabel')} ({profile.goals.length})
          </label>
          <div className="space-y-2">
            {profile.goals.map((goal) => {
              const goalConfig = getGoal(goal.id);
              const goalName = goalConfig?.nameEnglish || goal.name;

              return (
                <div
                  key={goal.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="font-medium text-foreground">{goalName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Add Goal Button */}
          <Button
            onClick={() => setIsGoalsModalOpen(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('learnersProfiles.addGoal') || 'Add Goal'}
          </Button>
        </Card>
      )}

      {/* Empty Goals State */}
      {(!profile.goals || profile.goals.length === 0) && (
        <Card className="p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t('learnersProfiles.noGoals') || 'No goals added yet'}
          </p>
          <Button
            onClick={() => setIsGoalsModalOpen(true)}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('learnersProfiles.addFirstGoal')}
          </Button>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-primary text-primary-foreground font-semibold py-3"
      >
        {t('learnersProfiles.saveChanges') || 'Save Changes'}
      </Button>

      {/* Delete Goal Confirmation Dialog */}
      <AlertDialog open={goalToDelete !== null} onOpenChange={(open) => !open && setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('learnersProfiles.deleteGoal') || 'Delete Goal?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('learnersProfiles.deleteGoalConfirm') ||
                'This action cannot be undone. All progress on this goal will be lost.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>{t('common.cancel') || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal} className="bg-destructive text-destructive-foreground">
              {t('common.delete') || 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Goals Modal */}
      <GoalsModalMenu
        profile={profile}
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
      />

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={handleAvatarSelect}
        currentAvatarId={selectedAvatar}
      />
    </div>
  );
};
