import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leadEvents, leads } from "@/db/schema";
import type { LeadEventType } from "@/constants/leads";
import type { ProfileRow } from "@/types/db";

function getLeadName(profile: ProfileRow): string {
  return profile.name?.trim() || profile.email.split("@")[0] || "Customer";
}

/** One lead per customer. Creates it on first sign-in, then only marks them as seen. */
export async function ensureLeadForProfile(profile: ProfileRow): Promise<void> {
  if (profile.role !== "customer") return;
  await db
    .insert(leads)
    .values({ profileId: profile.id, name: getLeadName(profile), phone: profile.phone, area: profile.address })
    .onConflictDoUpdate({ target: leads.profileId, set: { lastSeenAt: sql`now()` } });
}

type LeadEventInput = {
  profile: ProfileRow;
  type: LeadEventType;
  productId?: string | null;
  details?: Record<string, string>;
};

/** Saves what a customer did, for staff follow-up. Staff activity is not tracked. */
export async function recordLeadEvent(input: LeadEventInput): Promise<void> {
  if (input.profile.role !== "customer") return;
  const [lead] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.profileId, input.profile.id))
    .limit(1);
  if (!lead) return;
  await db.batch([
    db.insert(leadEvents).values({
      leadId: lead.id,
      type: input.type,
      productId: input.productId ?? null,
      details: input.details ?? {},
    }),
    db.update(leads).set({ lastSeenAt: sql`now()` }).where(eq(leads.id, lead.id)),
  ]);
}
