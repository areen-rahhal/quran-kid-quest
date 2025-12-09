import { useState } from 'react';
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
    age: '',
    selectedGoals: [] as string[],
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

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 1 || Number(formData.age) > 120)) {
      newErrors.age = t('common.validation.ageInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Create goal objects from selected goal IDs
    const goals = formData.selectedGoals
      .map(goalId => {
        const goalConfig = getGoalById(goalId);
        return goalConfig ? {
          id: goalId,
          name: goalConfig.nameEnglish,
          status: 'in-progress',
          completedSurahs: 0,
          totalSurahs: goalConfig.metadata?.surahCount || 0,
          phaseSize: goalConfig.metadata?.defaultPhaseSize || 5,
          phases: null,
          currentUnitId: goalConfig.units?.[0]?.id?.toString(),
        } : null;
      })
      .filter(Boolean) as any[];

    const childData: Omit<Profile, 'id'> = {
      name: formData.name.trim(),
      type: 'child',
      avatar: undefined,
      age: formData.age ? Number(formData.age) : undefined,
      goalsCount: goals.length,
      goals: goals,
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
      {/* Avatar Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">{t('common.avatar')}</Label>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
            <AvatarImage
              src={getAvatarImageUrl(formData.avatar)}
              initials={formData.name ? formData.name[0].toUpperCase() : '?'}
              name={formData.name}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{selectedAvatar?.label || 'Select Avatar'}</p>
            <p className="text-xs text-muted-foreground">{t('common.selectAvatar')}</p>
          </div>
        </div>
        <Select value={formData.avatar} onValueChange={(value) => setFormData(prev => ({ ...prev, avatar: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVATAR_OPTIONS.map(avatar => (
              <SelectItem key={avatar.id} value={avatar.id}>
                {avatar.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      {/* Age Input */}
      <div className="space-y-2">
        <Label htmlFor="age" className="text-sm font-medium">
          {t('common.age')}
        </Label>
        <Input
          id="age"
          type="number"
          placeholder={t('common.optional')}
          value={formData.age}
          onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
          className="h-10"
          min="1"
          max="120"
        />
        {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
      </div>

      {/* Tajweed Level */}
      <div className="space-y-2">
        <Label htmlFor="tajweedLevel" className="text-sm font-medium">
          {t('common.tajweedLevel')}
        </Label>
        <Select value={formData.tajweedLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, tajweedLevel: value as any }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">{t('common.tajweed.beginner')}</SelectItem>
            <SelectItem value="intermediate">{t('common.tajweed.intermediate')}</SelectItem>
            <SelectItem value="advanced">{t('common.tajweed.advanced')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Arabic Proficiency Toggle */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
        <input
          type="checkbox"
          id="arabicProficiency"
          checked={formData.arabicProficiency}
          onChange={(e) => setFormData(prev => ({ ...prev, arabicProficiency: e.target.checked }))}
          className="w-4 h-4 rounded border-border cursor-pointer"
        />
        <Label htmlFor="arabicProficiency" className="text-sm font-medium cursor-pointer flex-1">
          {t('common.arabicProficiency')}
        </Label>
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
