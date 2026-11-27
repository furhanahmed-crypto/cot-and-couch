import type { UserRole } from "@/constants/users";
import { AppError } from "@/lib/action-result";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { ProfileRow } from "@/types/db";

export const SIGN_IN_AGAIN_MESSAGE = "Please sign in again";

/** Signed-in profile, or an AppError the action turns into a toast. */
export async function requireProfile(): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AppError(SIGN_IN_AGAIN_MESSAGE);
  return profile;
}

function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "team";
}

/** Staff profile (admin or team), or null for customers and guests. */
export async function getStaffProfile(): Promise<ProfileRow | null> {
  const profile = await getCurrentProfile();
  if (!profile || !isStaffRole(profile.role)) return null;
  return profile;
}
