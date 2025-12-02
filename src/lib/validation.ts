import { z } from 'zod';
import type { Profile, Achievements } from '@/types/profile';
import type { GoalProgress, PhaseProgress as PhaseProgressType } from '@/types/goals';
import type { Phase, PhaseProgress } from '@/types/phases';

// Re-export canonical types
export type { Profile, Achievements } from '@/types/profile';
export type { GoalProgress } from '@/types/goals';
export type { Phase, PhaseProgress } from '@/types/phases';

// Base enums
export const ProfileTypeSchema = z.enum(['parent', 'child']);
export const GoalStatusSchema = z.enum(['in-progress', 'completed', 'paused']);
export const PhaseStatusSchema = z.enum(['not-started', 'in-progress', 'completed']);
export const LessonTypeSchema = z.enum(['listen', 'repeat', 'recall', 'exercise']);
export const TajweedLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const GoalTypeSchema = z.enum([
  'juz',
  'surah-xlong',
  'surah-long',
  'surah-medium',
  'surah-small',
  'surah-xsmall',
  'group',
]);
export const UnitTypeSchema = z.enum(['surah', 'quarter', 'page']);
export const DifficultySchema = z.enum(['short', 'medium', 'long']);

// Achievements schema (for validation)
export const AchievementsSchema = z.object({
  stars: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  recitations: z.number().int().nonnegative(),
  goalsCompleted: z.number().int().nonnegative(),
});

// Phase Progress schema
export const PhaseProgressSchema = z.object({
  id: z.string().min(1),
  phaseId: z.string().min(1),
  status: PhaseStatusSchema,
  completionDate: z.string().datetime().optional(),
  lastReviewDate: z.string().datetime().optional(),
  attemptCount: z.number().int().nonnegative().optional(),
});

// Goal Progress schema (for validation)
export const GoalProgressSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: GoalStatusSchema,
  completedSurahs: z.number().int().nonnegative().optional(),
  totalSurahs: z.number().int().nonnegative().optional(),
  phaseSize: z.number().int().positive().optional(),
  phases: z.array(PhaseProgressSchema).optional(),
  completionDate: z.string().datetime().optional(),
  currentUnitId: z.string().optional(),
});

// Base Unit schema
export const BaseUnitSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  arabicName: z.string().min(1),
  versesCount: z.number().int().positive(),
  startVerse: z.string().regex(/^\d+:\d+$/, 'Verse format must be "surah:verse"'),
  endVerse: z.string().regex(/^\d+:\d+$/, 'Verse format must be "surah:verse"'),
});

// Phase schema (for phase definitions)
export const PhaseSchema = z.object({
  id: z.string().min(1),
  sequenceNumber: z.number().int().positive(),
  versesStart: z.number().int().positive(),
  versesEnd: z.number().int().positive(),
  versesCount: z.number().int().positive(),
  arabicName: z.string().optional(),
  surahNumber: z.number().int().positive().optional(),
  startVerse: z.string().regex(/^\d+:\d+$/, 'Verse format must be "surah:verse"').optional(),
  endVerse: z.string().regex(/^\d+:\d+$/, 'Verse format must be "surah:verse"').optional(),
});

// Goal Metadata schema
export const GoalMetadataSchema = z.object({
  versesCount: z.number().int().positive(),
  pagesCount: z.number().int().positive(),
  quartersCount: z.number().int().positive(),
  surahCount: z.number().int().positive(),
  defaultUnit: UnitTypeSchema,
  difficulty: DifficultySchema,
  defaultPhaseSize: z.number().int().positive(),
  supportsCustomPhaseSize: z.boolean(),
});

// Goal Configuration schema (for goal definitions)
export const GoalConfigSchema = z.object({
  id: z.string().min(1),
  nameEnglish: z.string().min(1),
  nameArabic: z.string().min(1),
  type: GoalTypeSchema,
  metadata: GoalMetadataSchema,
  units: z.array(BaseUnitSchema).min(1),
  description: z.string().optional(),
});

// Profile schema (for validation)
export const ProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: ProfileTypeSchema,
  avatar: z.string().optional(),
  currentGoal: z.string().optional(),
  goals: z.array(GoalProgressSchema).optional(),
  goalsCount: z.number().int().nonnegative(),
  email: z.string().email().optional(),
  age: z.number().int().positive().optional(),
  arabicProficiency: z.boolean().optional(),
  arabicAccent: z.string().optional(),
  tajweedLevel: TajweedLevelSchema.optional(),
  streak: z.number().int().nonnegative().optional(),
  achievements: AchievementsSchema.optional(),
});

// Registration data schema
export const RegistrationDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  avatar: z.string().min(1, 'Avatar is required'),
});

// Profile update schema - partial profile without id
export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  type: ProfileTypeSchema.optional(),
  avatar: z.string().optional(),
  currentGoal: z.string().optional(),
  goals: z.array(GoalProgressSchema).optional(),
  goalsCount: z.number().int().nonnegative().optional(),
  email: z.string().email().optional(),
  age: z.number().int().positive().optional(),
  arabicProficiency: z.boolean().optional(),
  arabicAccent: z.string().optional(),
  tajweedLevel: TajweedLevelSchema.optional(),
  streak: z.number().int().nonnegative().optional(),
  achievements: AchievementsSchema.optional(),
});

// Add Goal schema (for adding goals to profile)
export const AddGoalSchema = z.object({
  profileId: z.string().min(1),
  goalId: z.string().min(1),
  goalName: z.string().min(1),
});

// Delete Goal schema
export const DeleteGoalSchema = z.object({
  profileId: z.string().min(1),
  goalId: z.string().min(1),
});

// Additional type exports (from Zod inference)
export type BaseUnit = z.infer<typeof BaseUnitSchema>;
export type GoalMetadata = z.infer<typeof GoalMetadataSchema>;
export type GoalConfig = z.infer<typeof GoalConfigSchema>;
export type PhaseSchemaType = z.infer<typeof PhaseSchema>;
export type PhaseProgressType = z.infer<typeof PhaseProgressSchema>;
export type RegistrationData = z.infer<typeof RegistrationDataSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type AddGoal = z.infer<typeof AddGoalSchema>;
export type DeleteGoal = z.infer<typeof DeleteGoalSchema>;
