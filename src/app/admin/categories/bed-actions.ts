"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  optionGroups,
  options,
  productVariants,
  products,
} from "@/db";
import {
  BED_CATEGORY_SLUG,
  BED_RANGE_COUNT,
  BED_RANGE_NAMES,
  BED_WIDTH_GROUP_KEY,
  bedCotTypeForRange,
  bedRangeSlug,
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

async function cotsCategoryId() {
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, BED_CATEGORY_SLUG))
    .limit(1);
  return cat?.id ?? null;
}

async function widthOptionsActive() {
  const [group] = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, BED_WIDTH_GROUP_KEY))
    .limit(1);
  if (!group) return [];
  return db
    .select()
    .from(options)
    .where(and(eq(options.groupId, group.id), eq(options.isActive, true)))
    .orderBy(asc(options.sortOrder));
}

async function rebuildVariantsForProduct(productId: string, rangeNumber: number) {
  const widths = await widthOptionsActive();
  if (!widths.length) return;

  const colourGroup = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, "colour"))
    .limit(1);
  const colours = colourGroup[0]
    ? await db
        .select()
        .from(options)
        .where(
          and(eq(options.groupId, colourGroup[0].id), eq(options.isActive, true)),
        )
    : [];

  await db.delete(productVariants).where(eq(productVariants.productId, productId));

  const prefix = `COT-R${rangeNumber}`;
  if (colours.length) {
    for (const w of widths) {
      for (const colour of colours) {
        await db.insert(productVariants).values({
          productId,
          sku: `${prefix}-${w.slug}-${colour.slug}`.slice(0, 80).toUpperCase(),
          widthOptionId: w.id,
          colourOptionId: colour.id,
          mrp: "0",
          price: "0",
          stockQty: 0,
          isActive: true,
        });
      }
    }
  } else {
    for (const w of widths) {
      await db.insert(productVariants).values({
        productId,
        sku: `${prefix}-${w.slug}`.slice(0, 80).toUpperCase(),
        widthOptionId: w.id,
        mrp: "0",
        price: "0",
        stockQty: 0,
        isActive: true,
      });
    }
  }
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
  const categoryId = await cotsCategoryId();
  if (!categoryId) return { ok: false as const, error: "Beds category missing" };

  const existing = await db
    .select({ rangeNumber: products.rangeNumber })
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        isNotNull(products.rangeNumber),
        eq(products.status, "published"),
      ),
    );

  const used = new Set(existing.map((r) => r.rangeNumber).filter(Boolean) as number[]);
  let slot: number | null = null;
  for (let n = 1; n <= BED_RANGE_COUNT; n++) {
    if (!used.has(n)) {
      slot = n;
      break;
    }
  }
  if (slot == null) {
    return { ok: false as const, error: "All 8 ranges already exist" };
  }

  const name = input.name.trim() || BED_RANGE_NAMES[slot] || `Range ${slot}`;
  const slug = bedRangeSlug(slot);

  const [row] = await db
    .insert(products)
    .values({
      categoryId,
      name,
      slug,
      rangeNumber: slot,
      cotType: bedCotTypeForRange(slot),
      status: "published",
      sortOrder: slot,
    })
    .returning({ id: products.id });

  await rebuildVariantsForProduct(row.id, slot);
  revalidateBedAdmin();
  return { ok: true as const, id: row.id };
}

export async function updateBedRangeAction(input: { id: string; name: string }) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };
  await db
    .update(products)
    .set({ name, updatedAt: new Date() })
    .where(eq(products.id, input.id));
  revalidateBedAdmin();
  return { ok: true as const };
}

export async function deleteBedRangeAction(id: string) {
  await requireStaffProfile();
  await db.delete(products).where(eq(products.id, id));
  revalidateBedAdmin();
  return { ok: true as const };
}
