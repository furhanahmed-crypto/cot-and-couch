/**
 * Ops / CRM reads from Neon (gallery, reels, store, leads, orders, …).
 */
import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { tagShopCache } from "@/lib/cache-tags";
import {
  auditLogs,
  collections,
  galleryItems,
  leads,
  orderStatusHistory,
  orders,
  reels,
  segments,
  storeSettings,
} from "@/db/schema";
import type {
  AuditLog,
  GalleryItem,
  Lead,
  OrderStatus,
  Reel,
  SaleOrder,
  Segment,
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
  return rows.map((l) => ({
    id: l.id,
    mobile: l.mobile,
    name: l.name,
    area: l.area ?? undefined,
    firstSeen: l.firstSeenAt.toISOString().slice(0, 10),
    lastSeen: l.lastSeenAt.toISOString().slice(0, 10),
    intent: l.intent,
    assignedTo: l.assignedToProfileId ?? undefined,
    whatsappOffers: l.whatsappOffers,
    viewedProductIds: l.viewedProductIds ?? [],
    shortlistedIds: l.shortlistedIds ?? [],
    ctaTaps: l.ctaTaps ?? [],
    followUpDone: l.followUpDone,
  }));
});

export const getOrders = cache(async (): Promise<SaleOrder[]> => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const histories = await db.select().from(orderStatusHistory);
  const historyByOrder = new Map<string, typeof histories>();
  for (const h of histories) {
    const list = historyByOrder.get(h.orderId) ?? [];
    list.push(h);
    historyByOrder.set(h.orderId, list);
  }

  return rows.map((o) => ({
    id: o.id,
    customerMobile: o.customerMobile,
    customerName: o.customerName,
    address: o.address,
    productId: o.productId ?? "",
    variantId: o.variantId ?? "",
    quantity: o.quantity,
    agreedPrice: Number(o.agreedPrice),
    advancePaid: Number(o.advancePaid),
    expectedDelivery: o.expectedDelivery ?? "",
    salesperson: o.salespersonName ?? "",
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
    notificationFailed: o.notificationFailed,
  }));
});

export const getAuditLogs = cache(async (): Promise<AuditLog[]> => {
  const rows = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.at));
  return rows.map((a) => ({
    id: a.id,
    at: a.at.toISOString(),
    user: a.actorName,
    action: a.action,
    detail: a.detail,
  }));
});

export const getSegments = cache(async (): Promise<Segment[]> => {
  const rows = await db
    .select()
    .from(segments)
    .where(eq(segments.isActive, true));
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description ?? "",
    count: s.count,
  }));
});
