"use server";

import { getCurrentProfile } from "@/lib/auth/profile";
import type { Profile } from "@/db";

/** Profile for the signed-in user, or null. */
export async function getMyProfile(): Promise<Profile | null> {
  return getCurrentProfile();
}

/** Staff only (admin | team). Returns null for customers / guests. */
export async function getStaffProfile(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (profile.role !== "admin" && profile.role !== "team") return null;
  return profile;
}

export async function requireStaffProfile(): Promise<Profile> {
  const profile = await getStaffProfile();
  if (!profile) throw new Error("Staff access required");
  return profile;
}

export async function isAdminProfile(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
