import { asc } from "drizzle-orm";
import { connection } from "next/server";
import {
  CATEGORY_CONFIGS,
  categoryConfigForSlug,
  type CategoryConfigDef,
} from "@/constants/category-config";
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

export type CategoryConfigAdmin = CategoryConfigDef & {
  groupsWithOptions: {
    key: string;
    label: string;
    options: AdminOption[];
  }[];
};

export type CategoryTemplatesData = {
  categories: Category[];
  brands: AdminMattressBrand[];
  optionsByGroup: Record<
    "purpose" | "comfort" | "filling" | "cover_material",
    AdminOption[]
  >;
  furnitureConfigs: CategoryConfigAdmin[];
  /** All furniture option groups keyed by group key */
  furnitureOptionsByKey: Record<string, AdminOption[]>;
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

  const furnitureOptionsByKey: Record<string, AdminOption[]> = {};

  for (const o of optionRows) {
    const key = groupKeyById.get(o.groupId);
    if (!key) continue;
    const mapped: AdminOption = {
      id: o.id,
      label: o.label,
      slug: o.slug,
      groupKey: key,
      isActive: o.isActive,
    };
    if ((MATTRESS_GROUPS as readonly string[]).includes(key)) {
      optionsByGroup[key as keyof typeof optionsByGroup].push(mapped);
    } else {
      const list = furnitureOptionsByKey[key] ?? [];
      list.push(mapped);
      furnitureOptionsByKey[key] = list;
    }
  }

  const furnitureConfigs: CategoryConfigAdmin[] = CATEGORY_CONFIGS.map(
    (def) => ({
      ...def,
      groupsWithOptions: def.groups.map((g) => ({
        key: g.key,
        label: g.label,
        options: furnitureOptionsByKey[g.key] ?? [],
      })),
    }),
  );

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
    furnitureConfigs,
    furnitureOptionsByKey,
  };
}

export async function getFurnitureOptionsForCategory(slug: string) {
  const def = categoryConfigForSlug(slug);
  if (!def) return { def: null, optionsByKey: {} as Record<string, AdminOption[]> };
  const data = await getCategoryTemplatesData();
  const optionsByKey: Record<string, AdminOption[]> = {};
  for (const g of def.groups) {
    optionsByKey[g.key] = (data.furnitureOptionsByKey[g.key] ?? []).filter(
      (o) => o.isActive,
    );
  }
  return { def, optionsByKey };
}
