"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  mattressBrandOptions,
  mattressBrands,
  optionGroups,
  options,
} from "@/db";
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

function revalidateCategories() {
  revalidatePath(ROUTES.admin.categories);
  revalidatePath(ROUTES.admin.brands);
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
}

export async function createMattressBrandAction(input: { name: string }) {
  await requireStaffProfile();
  const name = input.name.trim();
  const slug = slugify(name);
  if (!slug) return { ok: false as const, error: "Name required" };
  const [row] = await db
    .insert(mattressBrands)
    .values({
      name,
      slug,
      sortOrder: 99,
      defaults: {
        warrantyYears: "5",
        trialNights: "100",
        removableCover: "",
        flippable: "",
        idealFor: "",
      },
    })
    .returning({ id: mattressBrands.id });
  revalidateCategories();
  return { ok: true as const, id: row.id };
}

export async function updateMattressBrandAction(input: {
  id: string;
  name: string;
  isActive: boolean;
  defaults: Record<string, string>;
  optionIds: string[];
}) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };

  await db
    .update(mattressBrands)
    .set({
      name,
      isActive: input.isActive,
      defaults: Object.fromEntries(
        Object.entries(input.defaults).map(([k, v]) => [k, String(v ?? "").trim()]),
      ),
    })
    .where(eq(mattressBrands.id, input.id));

  await db
    .delete(mattressBrandOptions)
    .where(eq(mattressBrandOptions.brandId, input.id));

  const uniqueIds = [...new Set(input.optionIds.filter(Boolean))];
  if (uniqueIds.length) {
    await db.insert(mattressBrandOptions).values(
      uniqueIds.map((optionId) => ({ brandId: input.id, optionId })),
    );
  }

  revalidateCategories();
  return { ok: true as const };
}

export async function deleteMattressBrandAction(id: string) {
  await requireStaffProfile();
  try {
    await db.delete(mattressBrands).where(eq(mattressBrands.id, id));
  } catch {
    return {
      ok: false as const,
      error: "Brand is linked to products — deactivate instead",
    };
  }
  revalidateCategories();
  return { ok: true as const };
}

export async function createBrandGroupOptionAction(input: {
  brandId: string;
  groupKey: "purpose" | "comfort" | "filling" | "cover_material";
  label: string;
}) {
  await requireStaffProfile();
  const label = input.label.trim();
  const slug = slugify(label);
  if (!slug) return { ok: false as const, error: "Label required" };

  const [group] = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, input.groupKey))
    .limit(1);
  if (!group) return { ok: false as const, error: "Option group missing" };

  const [existing] = await db
    .select()
    .from(options)
    .where(and(eq(options.groupId, group.id), eq(options.slug, slug)))
    .limit(1);

  let optionId = existing?.id;
  if (!optionId) {
    const [row] = await db
      .insert(options)
      .values({
        groupId: group.id,
        label,
        slug,
        sortOrder: 50,
        isActive: true,
      })
      .returning({ id: options.id });
    optionId = row.id;
  }

  await db
    .insert(mattressBrandOptions)
    .values({ brandId: input.brandId, optionId })
    .onConflictDoNothing();

  revalidateCategories();
  return { ok: true as const, optionId };
}

/** Add an option to a furniture category config group (beds/sofas/desks). */
export async function createCategoryConfigOptionAction(input: {
  groupKey: string;
  label: string;
}) {
  await requireStaffProfile();
  const label = input.label.trim();
  const slug = slugify(label);
  if (!slug) return { ok: false as const, error: "Label required" };

  const [group] = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, input.groupKey))
    .limit(1);
  if (!group) {
    return {
      ok: false as const,
      error: "Config group missing — run bun run db:migrate and bun run db:seed",
    };
  }

  const [dup] = await db
    .select()
    .from(options)
    .where(and(eq(options.groupId, group.id), eq(options.slug, slug)))
    .limit(1);
  if (dup) return { ok: false as const, error: "Option already exists" };

  const [row] = await db
    .insert(options)
    .values({
      groupId: group.id,
      label,
      slug,
      sortOrder: 50,
      isActive: true,
    })
    .returning({ id: options.id });

  revalidateCategories();
  revalidatePath(ROUTES.admin.products);
  return { ok: true as const, optionId: row.id };
}

export async function updateCategoryConfigOptionAction(input: {
  id: string;
  label: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  const label = input.label.trim();
  if (!label) return { ok: false as const, error: "Label required" };
  await db
    .update(options)
    .set({ label, isActive: input.isActive })
    .where(eq(options.id, input.id));
  revalidateCategories();
  revalidatePath(ROUTES.admin.products);
  return { ok: true as const };
}

export async function deleteCategoryConfigOptionAction(id: string) {
  await requireStaffProfile();
  try {
    await db.delete(options).where(eq(options.id, id));
  } catch {
    return {
      ok: false as const,
      error: "Option is in use — deactivate instead",
    };
  }
  revalidateCategories();
  revalidatePath(ROUTES.admin.products);
  return { ok: true as const };
}
