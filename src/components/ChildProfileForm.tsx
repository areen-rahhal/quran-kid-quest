import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Profile } from '@/lib/validation';
import { getAllGoals, getGoalById } from '@/config/goals-data';

interface ChildProfileFormProps {
  onSubmit: (childData: Omit<Profile, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ChildProfileForm = ({ onSubmit, onCancel, isLoading = false }: ChildProfileFormProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    selectedGoal: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('common.validation.nameRequired');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('common.validation.nameMin');
    } else if (formData.name.trim().length > 20) {
      newErrors.name = t('common.validation.nameMax');
    }

    if (formData.dob) {
      const dob = new Date(formData.dob);
      const today = new Date();
      if (dob > today) {
        newErrors.dob = t('common.validation.dobInvalid') || 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = useCallback((dobString: string): number | null => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }, []);

  const displayAge = useMemo(() => calculateAge(formData.dob), [formData.dob, calculateAge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const goals = [];
    if (formData.selectedGoal) {
      const goalConfig = getGoalById(formData.selectedGoal);
      if (goalConfig) {
        goals.push({
          id: formData.selectedGoal,
          name: goalConfig.nameEnglish,
          status: 'in-progress',
          completedSurahs: 0,
          totalSurahs: goalConfig.metadata?.surahCount || 0,
          phaseSize: goalConfig.metadata?.defaultPhaseSize || 5,
          phases: null,
          currentUnitId: goalConfig.units?.[0]?.id?.toString(),
        });
      }
    }

    const age = formData.dob ? calculateAge(formData.dob) : undefined;

    const childData: Omit<Profile, 'id'> = {
      name: formData.name.trim(),
      type: 'child',
      avatar: undefined,
      age: age,
      goalsCount: goals.length,
      goals: goals.length > 0 ? goals : undefined,
      achievements: {
        stars: 0,
        streak: 0,
        recitations: 0,
        goalsCompleted: 0,
      },
    };

    try {
      await onSubmit(childData);
    } catch (error) {
      console.error('Error submitting child profile form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {t('common.name')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder={t('common.enterName')}
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="h-10"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Date of Birth Input */}
      <div className="space-y-2">
        <Label htmlFor="dob" className="text-sm font-medium">
          {t('learnersProfiles.dateOfBirth')} <span className="text-muted-foreground text-xs">({t('common.optional')})</span>
        </Label>
        <input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground h-10"
        />
        {displayAge !== null && (
          <p className="text-xs text-muted-foreground">
            {t('learnersProfiles.age')}: {displayAge} {displayAge === 1 ? 'year' : 'years'}
          </p>
        )}
        {errors.dob && <p className="text-xs text-destructive">{errors.dob}</p>}
      </div>

      {/* Goals Selection Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="goal-select" className="text-sm font-medium">
          {t('common.selectGoals')} <span className="text-muted-foreground text-xs">({t('common.optional')})</span>
        </Label>
        <Select value={formData.selectedGoal} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedGoal: value }))}>
          <SelectTrigger id="goal-select" className="h-10">
            <SelectValue placeholder={t('common.selectGoal')} />
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

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? t('common.creating') : t('common.create')}
        </Button>
      </div>
    </form>
  );
};
