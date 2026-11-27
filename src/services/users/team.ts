import { and, asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { UserRole } from "@/constants/users";
import { AppError } from "@/lib/action-result";
import type { StaffMember } from "@/types/admin-content";

/** Admins first, then team, by name. */
export async function listTeam(): Promise<StaffMember[]> {
  const rows = await db
    .select({ id: profiles.id, name: profiles.name, email: profiles.email, role: profiles.role, createdAt: profiles.createdAt })
    .from(profiles)
    .where(inArray(profiles.role, ["admin", "team"]))
    .orderBy(asc(profiles.role), asc(profiles.name));
  return rows.map(({ createdAt, ...row }) => ({ ...row, joinedAt: createdAt.toISOString() }));
}

async function countAdmins(): Promise<number> {
  const [row] = await db.select({ total: count() }).from(profiles).where(eq(profiles.role, "admin"));
  return row?.total ?? 0;
}

/**
 * Gives or removes staff access ("customer" = no access).
 * Nobody changes their own role, and the last admin always stays an admin.
 */
export async function changeRole(profileId: string, role: UserRole, actorId: string): Promise<void> {
  if (profileId === actorId) throw new AppError("You cannot change your own role");
  const [person] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, profileId));
  if (!person) throw new AppError("This person no longer exists");
  if (person.role === role) return;
  if (person.role === "admin" && (await countAdmins()) <= 1) throw new AppError("Keep at least one admin");
  await db.update(profiles).set({ role }).where(and(eq(profiles.id, profileId), eq(profiles.role, person.role)));
}
