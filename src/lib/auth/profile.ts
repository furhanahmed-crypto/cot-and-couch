import { cache } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type Profile } from "@/db";
import { auth } from "@/lib/auth/server";
import { ensureLeadForProfile } from "@/services/leads";

/** Create profile if missing. Safe to call after every sign-up / sign-in. */
export async function ensureProfile(input: {
  authUserId: string;
  email: string;
  name?: string | null;
  address?: string | null;
}): Promise<Profile> {
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, input.authUserId))
    .limit(1);

  if (existing[0]) {
    if (existing[0].role === "customer") {
      await ensureLeadForProfile(existing[0], { touchLastSeen: true });
    }
    return existing[0];
  }

  const inserted = await db
    .insert(profiles)
    .values({
      authUserId: input.authUserId,
      email: input.email,
      name: input.name ?? null,
      role: "customer",
      address: input.address?.trim() || null,
    })
    .returning();

  const profile = inserted[0];
  await ensureLeadForProfile(profile, { touchLastSeen: true });
  return profile;
}

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  await connection();
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;

  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, session.user.id))
    .limit(1);

  if (rows[0]) return rows[0];

  return ensureProfile({
    authUserId: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });
});
