"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { revalidateShopCache } from "@/lib/cache-tags";
import {
  galleryItems,
  leads,
  reels,
  segments,
  storeSettings,
} from "@/db/schema";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

export async function updateStoreSettingsAction(input: {
  name: string;
  address: string;
  mapUrl: string;
  timings: string;
  phone: string;
  whatsapp: string;
  privacyNotice: string;
}) {
  await requireStaffProfile();
  const rows = await db.select().from(storeSettings).limit(1);
  if (!rows[0]) {
    await db.insert(storeSettings).values({
      ...input,
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(storeSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(storeSettings.id, rows[0].id));
  }
  revalidatePath(ROUTES.admin.settings);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function createGalleryItemAction(input: {
  imageUrl: string;
  area: string;
  deliveryMonth: string;
  productId?: string;
  approved: boolean;
}) {
  await requireStaffProfile();
  await db.insert(galleryItems).values({
    imageUrl: input.imageUrl.trim(),
    area: input.area.trim(),
    deliveryMonth: input.deliveryMonth.trim(),
    productId: input.productId || null,
    approved: input.approved,
    sortOrder: 99,
  });
  revalidatePath(ROUTES.admin.gallery);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function updateGalleryItemAction(input: {
  id: string;
  approved: boolean;
  area: string;
  deliveryMonth: string;
}) {
  await requireStaffProfile();
  await db
    .update(galleryItems)
    .set({
      approved: input.approved,
      area: input.area.trim(),
      deliveryMonth: input.deliveryMonth.trim(),
    })
    .where(eq(galleryItems.id, input.id));
  revalidatePath(ROUTES.admin.gallery);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteGalleryItemAction(id: string) {
  await requireStaffProfile();
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
  revalidatePath(ROUTES.admin.gallery);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function createReelAction(input: {
  title: string;
  coverUrl: string;
  videoUrl: string;
  instagramUrl: string;
  tags: string;
}) {
  await requireStaffProfile();
  await db.insert(reels).values({
    title: input.title.trim(),
    coverUrl: input.coverUrl.trim(),
    videoUrl: input.videoUrl.trim(),
    instagramUrl: input.instagramUrl.trim() || null,
    tags: input.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sortOrder: 99,
  });
  revalidatePath(ROUTES.admin.reels);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function updateReelAction(input: {
  id: string;
  title: string;
  isActive: boolean;
  tags: string;
}) {
  await requireStaffProfile();
  await db
    .update(reels)
    .set({
      title: input.title.trim(),
      isActive: input.isActive,
      tags: input.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    })
    .where(eq(reels.id, input.id));
  revalidatePath(ROUTES.admin.reels);
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteReelAction(id: string) {
  await requireStaffProfile();
  await db.delete(reels).where(eq(reels.id, id));
  revalidatePath(ROUTES.admin.reels);
  revalidateShopCache();
  return { ok: true as const };
}

export async function updateLeadAction(input: {
  id: string;
  followUpDone: boolean;
  intent: "hot" | "warm" | "cold";
}) {
  await requireStaffProfile();
  await db
    .update(leads)
    .set({
      followUpDone: input.followUpDone,
      intent: input.intent,
    })
    .where(eq(leads.id, input.id));
  revalidatePath(ROUTES.admin.leads);
  return { ok: true as const };
}

export async function deleteLeadAction(id: string) {
  await requireStaffProfile();
  await db.delete(leads).where(eq(leads.id, id));
  revalidatePath(ROUTES.admin.leads);
  return { ok: true as const };
}

export async function createSegmentAction(input: {
  name: string;
  description: string;
  count: number;
}) {
  await requireStaffProfile();
  await db.insert(segments).values({
    name: input.name.trim(),
    description: input.description.trim() || null,
    count: input.count,
  });
  revalidatePath(ROUTES.admin.leads);
  return { ok: true as const };
}

export async function deleteSegmentAction(id: string) {
  await requireStaffProfile();
  await db.delete(segments).where(eq(segments.id, id));
  revalidatePath(ROUTES.admin.leads);
  return { ok: true as const };
}
