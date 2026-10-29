/**
 * Ops / CRM reads from Neon (`coc_*`).
 */
import { cache } from "react";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { tagShopCache } from "@/lib/cache-tags";
import {
  collections,
  galleryItems,
  leadEvents,
  leads,
  orderLines,
  orderStatusHistory,
  orders,
  reels,
  storeSettings,
} from "@/db";
import type {
  GalleryItem,
  Lead,
  OrderStatus,
  Reel,
  SaleOrder,
  StoreInfo,
  Collection,
} from "@/types";

export async function getStoreInfo(): Promise<StoreInfo> {
  "use cache";
  tagShopCache();
  const rows = await db.select().from(storeSettings).limit(1);
  const row = rows[0];
  if (!row) {
    return {
      name: "Cot & Couch",
      address: "",
      mapUrl: "",
      timings: "",
      phone: "",
      whatsapp: "",
      privacyNotice: "",
    };
  }
  return {
    name: row.name,
    address: row.address,
    mapUrl: row.mapUrl,
    timings: row.timings,
    phone: row.phone,
    whatsapp: row.whatsapp,
    privacyNotice: row.privacyNotice,
  };
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.isActive, true))
    .orderBy(asc(collections.sortOrder));
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    featured: c.featured,
  }));
}

export async function getCollectionBySlug(slug: string) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, slug))
    .limit(1);
  const c = rows[0];
  if (!c) return undefined;
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    featured: c.featured,
  } satisfies Collection;
}

export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder));
  return rows.map((g) => ({
    id: g.id,
    image: g.imageUrl,
    productId: g.productId ?? "",
    area: g.area,
    deliveryMonth: g.deliveryMonth,
    approved: g.approved,
  }));
}

export async function getReels(opts?: { includeHidden?: boolean }): Promise<Reel[]> {
  "use cache";
  tagShopCache();
  const rows = await db.select().from(reels).orderBy(asc(reels.sortOrder));
  const mapped = rows.map((r) => ({
    id: r.id,
    title: r.title,
    cover: r.coverUrl,
    videoUrl: r.videoUrl,
    instagramUrl: r.instagramUrl ?? "",
    tags: r.tags ?? [],
    order: r.sortOrder,
    active: r.isActive,
  }));
  if (opts?.includeHidden) return mapped;
  return mapped.filter((r) => r.active);
}

export const getLeads = cache(async (): Promise<Lead[]> => {
  const rows = await db.select().from(leads).orderBy(desc(leads.lastSeenAt));
  const leadIds = rows.map((l) => l.id);
  const events =
    leadIds.length === 0
      ? []
      : await db
          .select()
          .from(leadEvents)
          .where(inArray(leadEvents.leadId, leadIds));

  const byLead = new Map<string, typeof events>();
  for (const e of events) {
    const list = byLead.get(e.leadId) ?? [];
    list.push(e);
    byLead.set(e.leadId, list);
  }

  return rows.map((l) => {
    const ev = byLead.get(l.id) ?? [];
    const viewedProductIds = ev
      .filter((e) => e.eventType === "view" && e.productId)
      .map((e) => e.productId!);
    const shortlistedIds = ev
      .filter((e) => e.eventType === "shortlist" && e.productId)
      .map((e) => e.productId!);
    const ctaTaps = ev
      .filter((e) => e.eventType === "cta")
      .map((e) => ({
        type: e.payload?.type ?? "cta",
        productId: e.productId ?? undefined,
        at: e.occurredAt.toISOString(),
      }));

    return {
      id: l.id,
      mobile: l.mobile,
      name: l.name,
      area: l.area ?? undefined,
      firstSeen: l.firstSeenAt.toISOString().slice(0, 10),
      lastSeen: l.lastSeenAt.toISOString().slice(0, 10),
      intent: l.intent,
      assignedTo: l.assignedToProfileId ?? undefined,
      whatsappOffers: l.whatsappOffers,
      viewedProductIds,
      shortlistedIds,
      ctaTaps,
      followUpDone: l.followUpDone,
    };
  });
});

export const getOrders = cache(async (): Promise<SaleOrder[]> => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const orderIds = rows.map((o) => o.id);
  const [lines, histories] = await Promise.all([
    orderIds.length
      ? db.select().from(orderLines).where(inArray(orderLines.orderId, orderIds))
      : Promise.resolve([]),
    db.select().from(orderStatusHistory),
  ]);

  const lineByOrder = new Map<string, (typeof lines)[0]>();
  for (const line of lines) {
    if (!lineByOrder.has(line.orderId)) lineByOrder.set(line.orderId, line);
  }

  const historyByOrder = new Map<string, typeof histories>();
  for (const h of histories) {
    const list = historyByOrder.get(h.orderId) ?? [];
    list.push(h);
    historyByOrder.set(h.orderId, list);
  }

  return rows.map((o) => {
    const line = lineByOrder.get(o.id);
    return {
      id: o.id,
      customerMobile: o.customerMobile,
      customerName: o.customerName,
      address: o.address,
      productId: line?.productId ?? "",
      variantId: line?.variantId ?? "",
      quantity: line?.quantity ?? 1,
      agreedPrice: Number(line?.lineTotal ?? o.subtotal),
      advancePaid: Number(o.advancePaid),
      expectedDelivery: o.expectedDelivery ?? "",
      salesperson: "",
      status: o.status as OrderStatus,
      history: (historyByOrder.get(o.id) ?? [])
        .sort((a, b) => a.at.getTime() - b.at.getTime())
        .map((h) => ({
          status: h.status as OrderStatus,
          at: h.at.toISOString(),
          by: h.byName ?? "",
          note: h.note ?? undefined,
        })),
      deliveryPhoto: o.deliveryPhotoUrl ?? undefined,
      notificationFailed: false,
    };
  });
});
