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
      {/* Profile Header Card */}
      <Card className="p-8 text-center space-y-4 bg-gradient-to-b from-primary/5 to-transparent border-primary/20">
        {/* Avatar with Edit Icon Overlay */}
        <div className="flex justify-center">
          <div className="relative inline-block">
            <img
              src={getAvatarImageUrl(selectedAvatar)}
              alt="Selected Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md border-4 border-white"
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-3">
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter nickname"
            className="text-center text-2xl font-bold text-foreground border-0 border-b-2 border-primary/40 focus:border-primary/70 px-2 py-2 h-auto focus-visible:ring-0 focus-visible:outline-none transition-colors bg-transparent"
          />
          {displayAge !== null && (
            <p className="text-sm text-muted-foreground text-center">
              {displayAge} {displayAge === 1 ? 'year' : 'years'} old
            </p>
          )}
        </div>
      </Card>

      {/* Age / DOB */}
      <Card className="p-6 space-y-3 border-border/50">
        <label className="text-sm font-semibold text-foreground block">
          {t('learnersProfiles.dateOfBirth') || 'Date of Birth'}
        </label>
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
        />
      </Card>

      {/* Current Goals */}
      {profile.goals && profile.goals.length > 0 && (
        <Card className="p-6 space-y-4 border-border/50">
          <label className="text-sm font-semibold text-foreground block">
            {t('learnersProfiles.goalsLabel')} ({profile.goals.length})
          </label>
          <div className="space-y-2">
            {profile.goals.map((goal) => {
              const goalConfig = getGoal(goal.id);
              const goalName = goalConfig?.nameEnglish || goal.name;
              const numUnits = goalConfig?.units?.length || 0;
              const phaseSize = goal.phaseSize || goalConfig?.metadata?.defaultPhaseSize || 'N/A';
              const statusColor = {
                'in-progress': 'text-blue-600 bg-blue-50',
                'completed': 'text-green-600 bg-green-50',
                'paused': 'text-amber-600 bg-amber-50',
              };
              const statusLabel = {
                'in-progress': 'In Progress',
                'completed': 'Completed',
                'paused': 'Paused',
              };

              return (
                <div
                  key={goal.id}
                  className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/20 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
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
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-2 bg-white/50 rounded border border-primary/10">
                      <p className="text-muted-foreground mb-1">Units</p>
                      <p className="font-semibold text-foreground">{numUnits}</p>
                    </div>
                    <div className="p-2 bg-white/50 rounded border border-primary/10">
                      <p className="text-muted-foreground mb-1">Phase Size</p>
                      <p className="font-semibold text-foreground">{phaseSize}</p>
                    </div>
                    <div className={`p-2 rounded border border-primary/10 ${statusColor[goal.status as keyof typeof statusColor] || 'bg-white/50'}`}>
                      <p className="text-muted-foreground mb-1">Status</p>
                      <p className="font-semibold">{statusLabel[goal.status as keyof typeof statusLabel] || goal.status}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Goal Button */}
          <Button
            onClick={() => setIsGoalsModalOpen(true)}
            variant="outline"
            className="w-full gap-2 border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/5"
          >
            <Plus className="w-4 h-4" />
            {t('learnersProfiles.addGoal') || 'Add Goal'}
          </Button>
        </Card>
      )}

      {/* Empty Goals State */}
      {(!profile.goals || profile.goals.length === 0) && (
        <Card className="p-8 text-center space-y-4 border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
          <p className="text-sm text-muted-foreground">
            {t('learnersProfiles.noGoals') || 'No goals added yet'}
          </p>
          <Button
            onClick={() => setIsGoalsModalOpen(true)}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            {t('learnersProfiles.addFirstGoal')}
          </Button>
        </Card>
      )}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-12 text-base"
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
        profileId={profile.id}
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
