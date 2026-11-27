import { cache } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { ensureLeadForProfile } from "@/services/leads/mutations";
import type { ProfileRow } from "@/types/db";

type NewProfileInput = {
  authUserId: string;
  email: string;
  name?: string | null;
  address?: string | null;
};

async function findProfileByAuthUserId(authUserId: string): Promise<ProfileRow | null> {
  const [row] = await db.select().from(profiles).where(eq(profiles.authUserId, authUserId)).limit(1);
  return row ?? null;
}

/** Profile for a Neon Auth user, created on first sign-in. Safe to call on every sign-in. */
export async function ensureProfile(input: NewProfileInput): Promise<ProfileRow> {
  await db
    .insert(profiles)
    .values({
      authUserId: input.authUserId,
      email: input.email,
      name: input.name?.trim() || null,
      address: input.address?.trim() || null,
    })
    .onConflictDoNothing({ target: profiles.authUserId });
  const profile = await findProfileByAuthUserId(input.authUserId);
  if (!profile) throw new Error("Profile could not be created");
  await ensureLeadForProfile(profile);
  return profile;
}

/** The signed-in person's profile, or null for guests. One DB read per request. */
export const getCurrentProfile = cache(async (): Promise<ProfileRow | null> => {
  await connection();
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  const profile = await findProfileByAuthUserId(session.user.id);
  if (profile) return profile;
  return ensureProfile({ authUserId: session.user.id, email: session.user.email, name: session.user.name });
});
