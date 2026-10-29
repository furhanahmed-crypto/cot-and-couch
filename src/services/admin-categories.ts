import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { connection } from "next/server";
import {
  CATEGORY_CONFIGS,
  categoryConfigForSlug,
  type CategoryConfigDef,
} from "@/constants/category-config";
import { BED_CATEGORY_SLUG } from "@/constants/bed-model";
import { db } from "@/db";
import {
  collections,
  mattressBrandOptions,
  mattressBrands,
  optionGroups,
  options,
  productCollections,
  productVariants,
  products,
} from "@/db";
import { getCategories } from "@/services/catalogue";
import type { Category } from "@/types";

export type AdminOption = {
  id: string;
  label: string;
  slug: string;
  groupKey: string;
  isActive: boolean;
  detail?: string | null;
};

export type AdminBedRange = {
  id: string;
  name: string;
  slug: string;
  rangeNumber: number;
  cotType: string;
  variantCount: number;
  collectionLabels: string[];
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
  bedRanges: AdminBedRange[];
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
      detail: o.detail ?? null,
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

  const bedsCat = categories.find((c) => c.slug === BED_CATEGORY_SLUG);
  let bedRanges: AdminBedRange[] = [];
  if (bedsCat) {
    const rangeRows = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.categoryId, bedsCat.id),
          isNotNull(products.rangeNumber),
          eq(products.status, "published"),
        ),
      )
      .orderBy(asc(products.rangeNumber));

    const ids = rangeRows.map((p) => p.id);
    const variantCounts =
      ids.length === 0
        ? []
        : await db
            .select({
              productId: productVariants.productId,
              n: sql<number>`count(*)::int`,
            })
            .from(productVariants)
            .where(inArray(productVariants.productId, ids))
            .groupBy(productVariants.productId);

    const countByProduct = new Map(variantCounts.map((v) => [v.productId, v.n]));

    const collRows =
      ids.length === 0
        ? []
        : await db
            .select({
              productId: productCollections.productId,
              name: collections.name,
            })
            .from(productCollections)
            .innerJoin(collections, eq(productCollections.collectionId, collections.id))
            .where(inArray(productCollections.productId, ids));

    const collByProduct = new Map<string, string[]>();
    for (const row of collRows) {
      const list = collByProduct.get(row.productId) ?? [];
      list.push(row.name);
      collByProduct.set(row.productId, list);
    }

    bedRanges = rangeRows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      rangeNumber: p.rangeNumber!,
      cotType: p.cotType ?? "non_cushion",
      variantCount: countByProduct.get(p.id) ?? 0,
      collectionLabels: collByProduct.get(p.id) ?? [],
    }));
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
    furnitureConfigs,
    furnitureOptionsByKey,
    bedRanges,
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
