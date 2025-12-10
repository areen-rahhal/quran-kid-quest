import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Profile } from "@/types/profile";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate total number of goals across all profiles (parent + children)
 */
export function calculateTotalGoals(profiles: Profile[]): number {
  return profiles.reduce((total, profile) => {
    return total + (profile.goals?.length || profile.goalsCount || 0);
  }, 0);
}

/**
 * Check if user is new (has 0 goals across all profiles)
 */
export function isNewUser(profiles: Profile[]): boolean {
  return calculateTotalGoals(profiles) === 0;
}
