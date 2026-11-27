import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { shortlistItems } from "@/db/schema";
import { recordLeadEvent } from "@/services/leads/mutations";
import type { ProfileRow } from "@/types/db";

/** Adding twice is ignored (unique constraint), so no error is shown. */
export async function addToShortlist(profile: ProfileRow, productId: string): Promise<void> {
  const inserted = await db
    .insert(shortlistItems)
    .values({ profileId: profile.id, productId })
    .onConflictDoNothing()
    .returning({ id: shortlistItems.id });
  if (inserted.length) await recordLeadEvent({ profile, type: "shortlist", productId });
}

export async function removeFromShortlist(profileId: string, productId: string): Promise<void> {
  await db
    .delete(shortlistItems)
    .where(and(eq(shortlistItems.profileId, profileId), eq(shortlistItems.productId, productId)));
}
