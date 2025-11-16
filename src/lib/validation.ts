import { z } from 'zod';

// Base enums
export const ProfileTypeSchema = z.enum(['parent', 'child']);
export const GoalStatusSchema = z.enum(['in-progress', 'completed', 'paused']);
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

// Achievements schema
export const AchievementsSchema = z.object({
  stars: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(),
  recitations: z.number().int().nonnegative(),
  goalsCompleted: z.number().int().nonnegative(),
});

// Goal Progress schema (for user's progress on a goal)
export const GoalProgressSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: GoalStatusSchema,
  completedSurahs: z.number().int().nonnegative().optional(),
  totalSurahs: z.number().int().nonnegative().optional(),
});

// Base Unit schema
export const BaseUnitSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  arabicName: z.string().min(1),
});

// Goal Metadata schema
export const GoalMetadataSchema = z.object({
  versesCount: z.number().int().positive(),
  pagesCount: z.number().int().positive(),
  quartersCount: z.number().int().positive(),
  surahCount: z.number().int().positive(),
  defaultUnit: UnitTypeSchema,
  difficulty: DifficultySchema,
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

// Profile schema
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

// Profile update schema
export const ProfileUpdateSchema = ProfileSchema.partial().omit({ id: true });

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

// Type exports
export type Achievements = z.infer<typeof AchievementsSchema>;
export type GoalProgress = z.infer<typeof GoalProgressSchema>;
export type BaseUnit = z.infer<typeof BaseUnitSchema>;
export type GoalMetadata = z.infer<typeof GoalMetadataSchema>;
export type GoalConfig = z.infer<typeof GoalConfigSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type RegistrationData = z.infer<typeof RegistrationDataSchema>;
export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type AddGoal = z.infer<typeof AddGoalSchema>;
export type DeleteGoal = z.infer<typeof DeleteGoalSchema>;
