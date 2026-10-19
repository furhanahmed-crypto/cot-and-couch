import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads, profiles, type Profile } from "@/db/schema";
import type { Lead } from "@/types";

function displayName(profile: Profile) {
  const fromName = profile.name?.trim();
  if (fromName) return fromName;
  const local = profile.email?.split("@")[0]?.trim();
  return local || "Customer";
}

function contactMobile(profile: Profile) {
  const phone = profile.phone?.trim();
  if (phone) return phone;
  return profile.email?.trim() || "pending";
}

/**
 * Ensure a CRM lead exists for a storefront customer profile.
 * `touchLastSeen` updates last_seen (use on login / admin sync).
 */
export async function ensureLeadForProfile(
  profile: Profile,
  opts?: { touchLastSeen?: boolean },
) {
  if (profile.role !== "customer") return null;

  const existing = await db
    .select()
    .from(leads)
    .where(eq(leads.profileId, profile.id))
    .limit(1);

  if (existing[0]) {
    if (opts?.touchLastSeen) {
      await db
        .update(leads)
        .set({
          name: displayName(profile),
          mobile: contactMobile(profile),
          area: profile.area ?? existing[0].area,
          whatsappOffers: profile.whatsappOffers,
          lastSeenAt: new Date(),
        })
        .where(eq(leads.id, existing[0].id));
    }
    return existing[0];
  }

  const [row] = await db
    .insert(leads)
    .values({
      profileId: profile.id,
      name: displayName(profile),
      mobile: contactMobile(profile),
      area: profile.area ?? null,
      whatsappOffers: profile.whatsappOffers,
      intent: "cold",
      followUpDone: false,
      firstSeenAt: profile.createdAt ?? new Date(),
      lastSeenAt: new Date(),
    })
    .returning();

  return row;
}

/** Backfill leads for any customer profiles missing a lead row. */
export async function syncCustomerLeadsFromProfiles() {
  const customers = await db
    .select()
    .from(profiles)
    .where(eq(profiles.role, "customer"));

  const linked = await db
    .select({ profileId: leads.profileId })
    .from(leads)
    .where(sql`${leads.profileId} is not null`);

  const have = new Set(
    linked.map((r) => r.profileId).filter((id): id is string => Boolean(id)),
  );

  for (const profile of customers) {
    if (!have.has(profile.id)) {
      await ensureLeadForProfile(profile);
    }
  }
}

export type AdminLead = Lead & {
  email?: string;
  profileId?: string;
  source: "storefront" | "manual";
};

/** Admin leads list — storefront customers + any manual leads. */
export async function getAdminLeads(): Promise<AdminLead[]> {
  await syncCustomerLeadsFromProfiles();

  const rows = await db
    .select({
      lead: leads,
      email: profiles.email,
      phone: profiles.phone,
      profileName: profiles.name,
      profileArea: profiles.area,
      profileId: profiles.id,
      role: profiles.role,
    })
    .from(leads)
    .leftJoin(profiles, eq(leads.profileId, profiles.id))
    .orderBy(desc(leads.lastSeenAt));

  return rows
    .filter((r) => {
      if (r.profileId && r.role && r.role !== "customer") return false;
      return true;
    })
    .map((r) => {
      const l = r.lead;
      const storefront = Boolean(r.profileId);
      return {
        id: l.id,
        mobile: r.phone?.trim() || l.mobile,
        name: r.profileName?.trim() || l.name,
        area: r.profileArea ?? l.area ?? undefined,
        email: r.email ?? undefined,
        profileId: r.profileId ?? undefined,
        source: storefront ? ("storefront" as const) : ("manual" as const),
        firstSeen: l.firstSeenAt.toISOString().slice(0, 10),
        lastSeen: l.lastSeenAt.toISOString().slice(0, 10),
        intent: l.intent,
        assignedTo: l.assignedToProfileId ?? undefined,
        whatsappOffers: l.whatsappOffers,
        viewedProductIds: l.viewedProductIds ?? [],
        shortlistedIds: l.shortlistedIds ?? [],
        ctaTaps: l.ctaTaps ?? [],
        followUpDone: l.followUpDone,
      };
    });
}
