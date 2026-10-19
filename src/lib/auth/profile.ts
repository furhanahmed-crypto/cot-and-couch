import { cache } from "react";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { auth } from "@/lib/auth/server";

/** Create profile if missing. Safe to call after every sign-up / sign-in. */
export async function ensureProfile(input: {
  authUserId: string;
  email: string;
  name?: string | null;
  privacyConsent?: boolean;
  whatsappOffers?: boolean;
  area?: string | null;
}): Promise<Profile> {
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, input.authUserId))
    .limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(profiles)
    .values({
      authUserId: input.authUserId,
      email: input.email,
      name: input.name ?? null,
      role: "customer",
      privacyConsentAt: input.privacyConsent ? new Date() : null,
      whatsappOffers: input.whatsappOffers ?? false,
      area: input.area ?? null,
    })
    .returning();

  return inserted[0];
}

/**
 * Current Neon Auth user + app profile, or null.
 * `connection()` marks this as request-time so Cache Components
 * does not try to prerender session / Date values.
 */
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
