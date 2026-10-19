import { asc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import {
  mattressBrandOptions,
  mattressBrands,
  optionGroups,
  options,
} from "@/db/schema";
import { getCategories } from "@/services/catalogue";
import type { Category } from "@/types";

export type AdminOption = {
  id: string;
  label: string;
  slug: string;
  groupKey: string;
  isActive: boolean;
};

export type AdminMattressBrand = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  defaults: Record<string, string>;
  optionIds: string[];
};

export type CategoryTemplatesData = {
  categories: Category[];
  brands: AdminMattressBrand[];
  optionsByGroup: Record<
    "purpose" | "comfort" | "filling" | "cover_material",
    AdminOption[]
  >;
};

const MATTRESS_GROUPS = [
  "purpose",
  "comfort",
  "filling",
  "cover_material",
] as const;

export async function getCategoryTemplatesData(): Promise<CategoryTemplatesData> {
  await connection();
  const [categories, brandRows, groupRows, optionRows, links] =
    await Promise.all([
      getCategories({ includeHidden: true }),
      db.select().from(mattressBrands).orderBy(asc(mattressBrands.sortOrder)),
      db.select().from(optionGroups),
      db.select().from(options).orderBy(asc(options.sortOrder)),
      db.select().from(mattressBrandOptions),
    ]);

  const groupKeyById = new Map(groupRows.map((g) => [g.id, g.key]));
  const optionIdsByBrand = new Map<string, string[]>();
  for (const link of links) {
    const list = optionIdsByBrand.get(link.brandId) ?? [];
    list.push(link.optionId);
    optionIdsByBrand.set(link.brandId, list);
  }

  const optionsByGroup: CategoryTemplatesData["optionsByGroup"] = {
    purpose: [],
    comfort: [],
    filling: [],
    cover_material: [],
  };

  for (const o of optionRows) {
    const key = groupKeyById.get(o.groupId);
    if (!key || !(MATTRESS_GROUPS as readonly string[]).includes(key)) continue;
    optionsByGroup[key as keyof typeof optionsByGroup].push({
      id: o.id,
      label: o.label,
      slug: o.slug,
      groupKey: key,
      isActive: o.isActive,
    });
  }

  return {
    categories,
    brands: brandRows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      isActive: b.isActive,
      sortOrder: b.sortOrder,
      defaults: (b.defaults ?? {}) as Record<string, string>,
      optionIds: optionIdsByBrand.get(b.id) ?? [],
    })),
    optionsByGroup,
  };
}

/** Option IDs linked to a brand (empty = fall back to all active in group). */
export async function getBrandOptionIds(brandId: string): Promise<string[]> {
  const rows = await db
    .select({ optionId: mattressBrandOptions.optionId })
    .from(mattressBrandOptions)
    .where(eq(mattressBrandOptions.brandId, brandId));
  return rows.map((r) => r.optionId);
}

export async function getOptionsForBrandGroups(brandId: string | null) {
  const data = await getCategoryTemplatesData();
  if (!brandId) return data.optionsByGroup;
  const brand = data.brands.find((b) => b.id === brandId);
  if (!brand || brand.optionIds.length === 0) return data.optionsByGroup;

  const allowed = new Set(brand.optionIds);
  return {
    purpose: data.optionsByGroup.purpose.filter((o) => allowed.has(o.id)),
    comfort: data.optionsByGroup.comfort.filter((o) => allowed.has(o.id)),
    filling: data.optionsByGroup.filling.filter((o) => allowed.has(o.id)),
    cover_material: data.optionsByGroup.cover_material.filter((o) =>
      allowed.has(o.id),
    ),
  };
}
