import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { AppError } from "@/lib/action-result";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { ProfileRow } from "@/types/db";
import { SIGN_IN_AGAIN_MESSAGE } from "./require-profile";

const NOT_ALLOWED_MESSAGE = "Not allowed";

type StaffRole = "admin" | "team";

function isStaff(profile: Pick<ProfileRow, "role">): boolean {
  return profile.role === "admin" || profile.role === "team";
}

export function isAdmin(profile: Pick<ProfileRow, "role">): boolean {
  return profile.role === "admin";
}

/** Staff profile (admin or team), or null for customers and guests. */
export async function getStaffProfile(): Promise<ProfileRow | null> {
  const profile = await getCurrentProfile();
  return profile && isStaff(profile) ? profile : null;
}

/**
 * Step 1 of every admin action. Throws an AppError the action turns into a toast.
 * Pass "admin" for admin-only actions.
 */
export async function requireStaff(role: StaffRole = "team"): Promise<ProfileRow> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AppError(SIGN_IN_AGAIN_MESSAGE);
  if (!isStaff(profile)) throw new AppError(NOT_ALLOWED_MESSAGE);
  if (role === "admin" && !isAdmin(profile)) throw new AppError(NOT_ALLOWED_MESSAGE);
  return profile;
}

/** For admin-only pages: team users are sent to the dashboard. */
export async function requireAdminPage(): Promise<ProfileRow> {
  const profile = await getStaffProfile();
  if (!profile) redirect(ROUTES.home);
  if (!isAdmin(profile)) redirect(ROUTES.admin.root);
  return profile;
}
