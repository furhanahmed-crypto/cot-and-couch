import { desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { leadEvents, leads, profiles, type Profile } from "@/db";
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

function aggregateLeadEvents(
  events: (typeof leadEvents.$inferSelect)[],
) {
  const viewedProductIds: string[] = [];
  const shortlistedIds: string[] = [];
  const ctaTaps: Lead["ctaTaps"] = [];
  for (const e of events) {
    if (e.eventType === "view" && e.productId) viewedProductIds.push(e.productId);
    if (e.eventType === "shortlist" && e.productId) {
      shortlistedIds.push(e.productId);
    }
    if (e.eventType === "cta") {
      ctaTaps.push({
        type: e.payload?.type ?? "cta",
        productId: e.productId ?? undefined,
        at: e.occurredAt.toISOString(),
      });
    }
  }
  return { viewedProductIds, shortlistedIds, ctaTaps };
}

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
          area: profile.address ?? existing[0].area,
          lastSeenAt: new Date(),
          updatedAt: new Date(),
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
      area: profile.address ?? null,
      intent: "cold",
      followUpDone: false,
      firstSeenAt: profile.createdAt ?? new Date(),
      lastSeenAt: new Date(),
    })
    .returning();

  return row;
}

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

export async function getAdminLeads(): Promise<AdminLead[]> {
  await syncCustomerLeadsFromProfiles();

  const rows = await db
    .select({
      lead: leads,
      email: profiles.email,
      phone: profiles.phone,
      profileName: profiles.name,
      profileAddress: profiles.address,
      profileId: profiles.id,
      role: profiles.role,
    })
    .from(leads)
    .leftJoin(profiles, eq(leads.profileId, profiles.id))
    .orderBy(desc(leads.lastSeenAt));

  const leadIds = rows.map((r) => r.lead.id);
  const events =
    leadIds.length === 0
      ? []
      : await db
          .select()
          .from(leadEvents)
          .where(inArray(leadEvents.leadId, leadIds));
  const eventsByLead = new Map<string, typeof events>();
  for (const e of events) {
    const list = eventsByLead.get(e.leadId) ?? [];
    list.push(e);
    eventsByLead.set(e.leadId, list);
  }

  return rows
    .filter((r) => {
      if (r.profileId && r.role && r.role !== "customer") return false;
      return true;
    })
    .map((r) => {
      const l = r.lead;
      const storefront = Boolean(r.profileId);
      const agg = aggregateLeadEvents(eventsByLead.get(l.id) ?? []);
      return {
        id: l.id,
        mobile: r.phone?.trim() || l.mobile,
        name: r.profileName?.trim() || l.name,
        area: r.profileAddress ?? l.area ?? undefined,
        email: r.email ?? undefined,
        profileId: r.profileId ?? undefined,
        source: storefront ? ("storefront" as const) : ("manual" as const),
        firstSeen: l.firstSeenAt.toISOString().slice(0, 10),
        lastSeen: l.lastSeenAt.toISOString().slice(0, 10),
        intent: l.intent,
        assignedTo: l.assignedToProfileId ?? undefined,
        whatsappOffers: l.whatsappOffers,
        followUpDone: l.followUpDone,
        ...agg,
      };
    });
}
