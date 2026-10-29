"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { revalidateShopCache } from "@/lib/cache-tags";
import {
  collections,
  mattressBrands,
  optionGroups,
  options,
  productVariants,
  sizeDimensions,
} from "@/db";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function colourGroupId() {
  const rows = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, "colour"))
    .limit(1);
  if (!rows[0]) throw new Error("Colour option group missing — run db:seed");
  return rows[0].id;
}

async function sizeGroupId() {
  const rows = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, "size_group"))
    .limit(1);
  if (!rows[0]) throw new Error("Size option group missing — run db:seed");
  return rows[0].id;
}

function revalidateMasters() {
  revalidatePath(ROUTES.admin.brands);
  revalidatePath("/");
  revalidatePath(ROUTES.catalogue);
  revalidateShopCache();
}

// —— Colours ——

export async function createColourAction(input: {
  label: string;
  hex: string;
}) {
  await requireStaffProfile();
  const groupId = await colourGroupId();
  const slug = slugify(input.label);
  if (!slug) return { ok: false as const, error: "Name required" };
  await db.insert(options).values({
    groupId,
    label: input.label.trim(),
    slug,
    hex: input.hex.trim() || "#CCCCCC",
    sortOrder: 99,
  });
  revalidateMasters();
  return { ok: true as const };
}

export async function updateColourAction(input: {
  id: string;
  label: string;
  hex: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  await db
    .update(options)
    .set({
      label: input.label.trim(),
      hex: input.hex.trim() || "#CCCCCC",
      isActive: input.isActive,
    })
    .where(eq(options.id, input.id));
  revalidateMasters();
  return { ok: true as const };
}

export async function deleteColourAction(id: string) {
  await requireStaffProfile();
  const used = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.colourOptionId, id))
    .limit(1);
  if (used[0]) {
    return {
      ok: false as const,
      error: "Colour is used on variants — deactivate instead of delete",
    };
  }
  await db.delete(options).where(eq(options.id, id));
  revalidateMasters();
  return { ok: true as const };
}

// —— Mattress brands ——

export async function createBrandAction(input: { name: string }) {
  await requireStaffProfile();
  const slug = slugify(input.name);
  if (!slug) return { ok: false as const, error: "Name required" };
  await db.insert(mattressBrands).values({
    name: input.name.trim(),
    slug,
    sortOrder: 99,
  });
  revalidateMasters();
  return { ok: true as const };
}

export async function updateBrandAction(input: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  await db
    .update(mattressBrands)
    .set({ name: input.name.trim(), isActive: input.isActive })
    .where(eq(mattressBrands.id, input.id));
  revalidateMasters();
  return { ok: true as const };
}

export async function deleteBrandAction(id: string) {
  await requireStaffProfile();
  try {
    await db.delete(mattressBrands).where(eq(mattressBrands.id, id));
  } catch {
    return {
      ok: false as const,
      error: "Brand is linked to products — deactivate instead",
    };
  }
  revalidateMasters();
  return { ok: true as const };
}

// —— Collections (Royal Range / Victoria) ——

export async function createCollectionAction(input: {
  name: string;
  description: string;
  featured: boolean;
}) {
  await requireStaffProfile();
  const slug = slugify(input.name);
  if (!slug) return { ok: false as const, error: "Name required" };
  await db.insert(collections).values({
    name: input.name.trim(),
    slug,
    description: input.description.trim() || null,
    featured: input.featured,
    sortOrder: 99,
  });
  revalidateMasters();
  return { ok: true as const };
}

export async function updateCollectionAction(input: {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  isActive: boolean;
}) {
  await requireStaffProfile();
  await db
    .update(collections)
    .set({
      name: input.name.trim(),
      description: input.description.trim() || null,
      featured: input.featured,
      isActive: input.isActive,
    })
    .where(eq(collections.id, input.id));
  revalidateMasters();
  return { ok: true as const };
}

export async function deleteCollectionAction(id: string) {
  await requireStaffProfile();
  await db.delete(collections).where(eq(collections.id, id));
  revalidateMasters();
  return { ok: true as const };
}

// —— Size dimensions ——

export async function createSizeAction(input: {
  sizeGroupSlug: string;
  lengthIn: number;
  widthIn: number;
}) {
  await requireStaffProfile();
  const groupId = await sizeGroupId();
  const groupOpt = await db
    .select()
    .from(options)
    .where(
      and(eq(options.groupId, groupId), eq(options.slug, input.sizeGroupSlug)),
    )
    .limit(1);
  if (!groupOpt[0]) return { ok: false as const, error: "Size group not found" };
  await db.insert(sizeDimensions).values({
    sizeGroupOptionId: groupOpt[0].id,
    lengthIn: input.lengthIn,
    widthIn: input.widthIn,
    label: `${input.lengthIn}x${input.widthIn} inch`,
    sortOrder: 99,
  });
  revalidateMasters();
  return { ok: true as const };
}

export async function updateSizeAction(input: {
  id: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  await db
    .update(sizeDimensions)
    .set({ isActive: input.isActive })
    .where(eq(sizeDimensions.id, input.id));
  revalidateMasters();
  return { ok: true as const };
}

export async function deleteSizeAction(id: string) {
  await requireStaffProfile();
  const used = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.sizeDimensionId, id))
    .limit(1);
  if (used[0]) {
    return {
      ok: false as const,
      error: "Size is used on variants — deactivate instead",
    };
  }
  await db.delete(sizeDimensions).where(eq(sizeDimensions.id, id));
  revalidateMasters();
  return { ok: true as const };
}

export async function listSizeGroupSlugsAction() {
  await requireStaffProfile();
  const groupId = await sizeGroupId();
  const rows = await db
    .select()
    .from(options)
    .where(eq(options.groupId, groupId));
  return rows.map((r) => ({ slug: r.slug, label: r.label }));
}
