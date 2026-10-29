"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { bedRanges, optionGroups, options, products } from "@/db";
import {
  BED_WIDTH_GROUP_KEY,
  bedCotTypeForRange,
} from "@/constants/bed-model";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function revalidateBedAdmin() {
  revalidatePath(ROUTES.admin.categories);
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
}

export async function createBedWidthOptionAction(input: {
  name: string;
  size: string;
}) {
  await requireStaffProfile();
  const label = input.name.trim();
  const detail = input.size.trim();
  const slug = slugify(label);
  if (!label || !detail) {
    return { ok: false as const, error: "Name and size required" };
  }

  const [group] = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, BED_WIDTH_GROUP_KEY))
    .limit(1);
  if (!group) return { ok: false as const, error: "Bed width group missing" };

  const [dup] = await db
    .select({ id: options.id })
    .from(options)
    .where(and(eq(options.groupId, group.id), eq(options.slug, slug)))
    .limit(1);
  if (dup) return { ok: false as const, error: "Width name already exists" };

  const [row] = await db
    .insert(options)
    .values({
      groupId: group.id,
      label,
      detail,
      slug,
      sortOrder: 99,
      isActive: true,
    })
    .returning({ id: options.id });

  revalidateBedAdmin();
  return { ok: true as const, id: row.id };
}

export async function updateBedWidthOptionAction(input: {
  id: string;
  name: string;
  size: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  const label = input.name.trim();
  const detail = input.size.trim();
  if (!label || !detail) {
    return { ok: false as const, error: "Name and size required" };
  }
  await db
    .update(options)
    .set({ label, detail, isActive: input.isActive })
    .where(eq(options.id, input.id));
  revalidateBedAdmin();
  return { ok: true as const };
}

export async function createBedRangeAction(input: { name: string }) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };
  const slug = slugify(name);
  if (!slug) return { ok: false as const, error: "Invalid name" };

  const [dup] = await db
    .select({ id: bedRanges.id })
    .from(bedRanges)
    .where(eq(bedRanges.slug, slug))
    .limit(1);
  if (dup) return { ok: false as const, error: "Range already exists" };

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${bedRanges.sortOrder}), 0)` })
    .from(bedRanges);
  const sortOrder = Number(max) + 1;

  const [row] = await db
    .insert(bedRanges)
    .values({
      name,
      slug,
      sortOrder,
      cotType: bedCotTypeForRange(sortOrder),
      isActive: true,
    })
    .returning({ id: bedRanges.id });

  revalidateBedAdmin();
  return { ok: true as const, id: row.id };
}

export async function updateBedRangeAction(input: { id: string; name: string }) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };
  await db
    .update(bedRanges)
    .set({ name })
    .where(eq(bedRanges.id, input.id));
  revalidateBedAdmin();
  return { ok: true as const };
}

export async function deleteBedRangeAction(id: string) {
  await requireStaffProfile();
  const [linked] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.bedRangeId, id))
    .limit(1);
  if (linked) {
    return {
      ok: false as const,
      error: "Remove or reassign products in this range first",
    };
  }
  await db.delete(bedRanges).where(eq(bedRanges.id, id));
  revalidateBedAdmin();
  return { ok: true as const };
}
