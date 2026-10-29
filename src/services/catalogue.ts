/**
 * Catalogue reads from Neon. Client cards must import sync helpers from
 * `@/lib/catalogue-utils` so this file can stay server-only (`"use cache"`).
 */
import { cache } from "react";
import { connection } from "next/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { tagShopCache } from "@/lib/cache-tags";
import {
  filterProductList,
  type FilterState,
  type SortKey,
} from "@/lib/catalogue-utils";
import {
  categories as categoriesTable,
  collections as collectionsTable,
  bedRanges as bedRangesTable,
  mattressBrandOptions,
  mattressBrands as brandsTable,
  optionGroups,
  options,
  productCollections,
  productOptionValues,
  productVariants,
  products as productsTable,
  sizeDimensions,
  type ProductVariant,
} from "@/db";
import {
  mapBrand,
  mapCategory,
  mapColour,
  mapProduct,
  mapSize,
  type OptionLookup,
} from "@/services/catalogue-map";
import { getCollectionBySlug as getOpsCollectionBySlug, getCollections, getStoreInfo } from "@/services/ops";
import { allCategoryConfigGroupKeys } from "@/constants/category-config";
import {
  categoriesForShop,
  categoryForShop,
} from "@/lib/shop-category-label";
import type { Product, ProductEditorLookups } from "@/types";

export type { FilterState, SortKey } from "@/lib/catalogue-utils";
export {
  filterProductList,
  maxDiscount,
  productColours,
  startingPrice,
  worstStock,
} from "@/lib/catalogue-utils";

const loadOptionsById = cache(async (): Promise<OptionLookup> => {
  const rows = await db.select().from(options);
  return new Map(rows.map((r) => [r.id, r]));
});

const loadCategorySlugById = cache(async (): Promise<Map<string, string>> => {
  const rows = await db.select().from(categoriesTable);
  return new Map(rows.map((r) => [r.id, r.slug]));
});

type VariantMode = "list" | "full";

/**
 * list — cheapest SKU per colour (PLP / home / cards). Avoids shipping ~14k mattress SKUs.
 * full — every SKU (PDP pickers, admin pricing/stock).
 */
async function loadVariantsByProductIds(
  productIds: string[],
  mode: VariantMode,
) {
  const empty = new Map<string, ProductVariant[]>();
  if (!productIds.length) return empty;

  let rows: ProductVariant[];

  if (mode === "list") {
    const result = await db.execute(sql`
      SELECT DISTINCT ON (product_id, colour_option_id)
        id,
        product_id AS "productId",
        sku,
        size_group_option_id AS "sizeGroupOptionId",
        size_dimension_id AS "sizeDimensionId",
        is_custom_size AS "isCustomSize",
        thickness_option_id AS "thicknessOptionId",
        colour_option_id AS "colourOptionId",
        mrp,
        price,
        stock_qty AS "stockQty",
        is_active AS "isActive",
        created_at AS "createdAt"
      FROM coc_product_variants
      WHERE is_active = true
        AND product_id IN (${sql.join(
          productIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        )})
      ORDER BY product_id, colour_option_id, price ASC
    `);
    const raw = result as unknown;
    rows = (
      Array.isArray(raw) ? raw : (raw as { rows: ProductVariant[] }).rows
    ) as ProductVariant[];
  } else {
    rows = await db
      .select()
      .from(productVariants)
      .where(
        and(
          inArray(productVariants.productId, productIds),
          eq(productVariants.isActive, true),
        ),
      );
  }

  const map = new Map<string, ProductVariant[]>();
  for (const row of rows) {
    const list = map.get(row.productId) ?? [];
    list.push(row);
    map.set(row.productId, list);
  }
  return map;
}

export async function getCategories(opts?: { includeHidden?: boolean }) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));
  const mapped = rows.map(mapCategory);
  if (opts?.includeHidden) return mapped;
  return mapped.filter((c) => c.visible);
}

/**
 * Admin catalogue — uncached so labels match DB (e.g. “Cots”).
 * Do not use shop helpers here; shop maps `cots` → “Beds”.
 */
export async function getAdminCategories(opts?: { includeHidden?: boolean }) {
  await connection();
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));
  const mapped = rows.map(mapCategory);
  if (opts?.includeHidden) return mapped;
  return mapped.filter((c) => c.visible);
}

export async function getCategoryBySlug(slug: string) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return rows[0] ? mapCategory(rows[0]) : undefined;
}

/** Storefront categories — slug `cots` displays as “Beds” (admin keeps “Cots”). */
export async function getShopCategories() {
  return categoriesForShop(await getCategories());
}

export async function getShopCategoryBySlug(slug: string) {
  const category = await getCategoryBySlug(slug);
  if (!category?.visible) return undefined;
  return categoryForShop(category);
}

async function loadCollectionIdByProduct(
  productIds: string[],
): Promise<Map<string, string>> {
  if (!productIds.length) return new Map();
  const links = await db
    .select()
    .from(productCollections)
    .where(inArray(productCollections.productId, productIds));
  const map = new Map<string, string>();
  for (const link of links) {
    if (!map.has(link.productId)) map.set(link.productId, link.collectionId);
  }
  return map;
}

const loadDimLabels = cache(async (): Promise<Map<string, string>> => {
  const rows = await db.select().from(sizeDimensions);
  return new Map(rows.map((d) => [d.id, d.label]));
});

const MATTRESS_OPTION_KEYS = [
  "purpose",
  "cover_material",
  "filling",
  "comfort",
] as const;

type ProductOptionMeta = {
  purposeOptionId: string | null;
  coverMaterialOptionId: string | null;
  fillingOptionId: string | null;
  comfortOptionId: string | null;
  attributes: Record<string, string>;
};

async function loadProductOptionMeta(
  productIds: string[],
): Promise<Map<string, ProductOptionMeta>> {
  const empty = (): ProductOptionMeta => ({
    purposeOptionId: null,
    coverMaterialOptionId: null,
    fillingOptionId: null,
    comfortOptionId: null,
    attributes: {},
  });
  if (!productIds.length) return new Map();

  const rows = await db
    .select({
      productId: productOptionValues.productId,
      groupKey: optionGroups.key,
      optionId: productOptionValues.optionId,
      textValue: productOptionValues.textValue,
    })
    .from(productOptionValues)
    .innerJoin(optionGroups, eq(optionGroups.id, productOptionValues.optionGroupId))
    .where(inArray(productOptionValues.productId, productIds));

  const map = new Map<string, ProductOptionMeta>();
  for (const id of productIds) map.set(id, empty());

  for (const row of rows) {
    const meta = map.get(row.productId) ?? empty();
    const key = row.groupKey;
    if (
      row.optionId &&
      (MATTRESS_OPTION_KEYS as readonly string[]).includes(key)
    ) {
      if (key === "purpose") meta.purposeOptionId = row.optionId;
      if (key === "cover_material") meta.coverMaterialOptionId = row.optionId;
      if (key === "filling") meta.fillingOptionId = row.optionId;
      if (key === "comfort") meta.comfortOptionId = row.optionId;
    } else if (row.textValue?.trim()) {
      meta.attributes[key] = row.textValue.trim();
    } else if (row.optionId) {
      meta.attributes[key] = row.optionId;
    }
    map.set(row.productId, meta);
  }
  return map;
}

async function hydrateProducts(
  rows: (typeof productsTable.$inferSelect)[],
  mode: VariantMode,
): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [opts, catSlugs, variantsByProduct, collectionByProduct, dimLabels, optionMeta] =
    await Promise.all([
      loadOptionsById(),
      loadCategorySlugById(),
      loadVariantsByProductIds(ids, mode),
      loadCollectionIdByProduct(ids),
      loadDimLabels(),
      loadProductOptionMeta(ids),
    ]);

  const rangeIds = [
    ...new Set(rows.map((r) => r.bedRangeId).filter(Boolean)),
  ] as string[];
  const rangeNameById = new Map<string, string>();
  const rangeSlugById = new Map<string, string>();
  if (rangeIds.length) {
    const rangeRows = await db
      .select({
        id: bedRangesTable.id,
        name: bedRangesTable.name,
        slug: bedRangesTable.slug,
      })
      .from(bedRangesTable)
      .where(inArray(bedRangesTable.id, rangeIds));
    for (const r of rangeRows) {
      rangeNameById.set(r.id, r.name);
      rangeSlugById.set(r.id, r.slug);
    }
  }

  return rows.map((row) => {
    const meta = optionMeta.get(row.id);
    const enriched = {
      ...row,
      purposeOptionId: meta?.purposeOptionId ?? null,
      coverMaterialOptionId: meta?.coverMaterialOptionId ?? null,
      fillingOptionId: meta?.fillingOptionId ?? null,
      comfortOptionId: meta?.comfortOptionId ?? null,
      attributes: meta?.attributes ?? {},
    };
    const product = mapProduct(
      enriched,
      variantsByProduct.get(row.id) ?? [],
      opts,
      catSlugs.get(row.categoryId) ?? "mattresses",
      dimLabels,
    );
    const collectionId = collectionByProduct.get(row.id);
    if (collectionId) product.collectionId = collectionId;
    if (row.bedRangeId) {
      product.bedRangeId = row.bedRangeId;
      product.bedRangeName = rangeNameById.get(row.bedRangeId) ?? null;
      product.bedRangeSlug = rangeSlugById.get(row.bedRangeId) ?? null;
    }
    product.cotType = row.cotType ?? null;
    return product;
  });
}

/** Shop lists — slim variants (one per colour). */
export async function getPublishedProducts() {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.status, "published"))
    .orderBy(asc(productsTable.sortOrder));
  return hydrateProducts(rows, "list");
}

/** Category PLP — only that category, slim variants. */
export async function getPublishedProductsByCategoryId(categoryId: string) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.status, "published"),
        eq(productsTable.categoryId, categoryId),
      ),
    )
    .orderBy(asc(productsTable.sortOrder));
  return hydrateProducts(rows, "list");
}

/** Admin — full variant matrix (request-time; not in static shell). */
export const getAllProducts = cache(async () => {
  await connection();
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder));
  return hydrateProducts(rows, "full");
});

export async function getProductBySlug(slug: string) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.slug, slug))
    .limit(1);
  if (!rows[0] || rows[0].status !== "published") return undefined;
  const [product] = await hydrateProducts(rows, "full");
  return product;
}

export async function getProductById(id: string) {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!rows[0]) return undefined;
  const [product] = await hydrateProducts(rows, "full");
  return product;
}

/** Admin editor — uncached so edits show immediately. */
export async function getAdminProductById(id: string) {
  await connection();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  if (!rows[0]) return undefined;
  const [product] = await hydrateProducts(rows, "full");
  return product;
}

export async function getProductsByIds(ids: string[]) {
  "use cache";
  tagShopCache();
  if (!ids.length) return [];
  const unique = [...new Set(ids)];
  const rows = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, unique));
  const hydrated = await hydrateProducts(rows, "list");
  const byId = new Map(hydrated.map((p) => [p.id, p]));
  return unique.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export async function getFeaturedProducts() {
  "use cache";
  tagShopCache();
  const rows = await db
    .select()
    .from(productsTable)
    .where(
      and(
        eq(productsTable.status, "published"),
        eq(productsTable.isFeatured, true),
      ),
    )
    .orderBy(asc(productsTable.sortOrder));
  const products = await hydrateProducts(rows, "list");
  return products.sort((a, b) => b.popularity - a.popularity);
}

export async function getProductsByCollectionSlug(slug: string) {
  "use cache";
  tagShopCache();
  const col = await db
    .select()
    .from(collectionsTable)
    .where(eq(collectionsTable.slug, slug))
    .limit(1);
  if (!col[0]) return [];
  const links = await db
    .select()
    .from(productCollections)
    .where(eq(productCollections.collectionId, col[0].id));
  return getProductsByIds(links.map((l) => l.productId));
}

export async function getRoyalRangeProducts() {
  return getProductsByCollectionSlug("royal-range");
}

export async function getMasters() {
  "use cache";
  tagShopCache();
  const [brandRows, groupRows, optionRows, dimRows] = await Promise.all([
    db.select().from(brandsTable).orderBy(asc(brandsTable.sortOrder)),
    db.select().from(optionGroups).orderBy(asc(optionGroups.sortOrder)),
    db.select().from(options).orderBy(asc(options.sortOrder)),
    db.select().from(sizeDimensions).orderBy(asc(sizeDimensions.sortOrder)),
  ]);

  const colourGroup = groupRows.find((g) => g.key === "colour");
  const sizeGroup = groupRows.find((g) => g.key === "size_group");
  const colours = optionRows
    .filter((o) => colourGroup && o.groupId === colourGroup.id)
    .map(mapColour);
  const sizeOpts = optionRows.filter(
    (o) => sizeGroup && o.groupId === sizeGroup.id,
  );
  const sizeLabelById = new Map(sizeOpts.map((o) => [o.id, o.label]));

  const [collectionList, storeInfo] = await Promise.all([
    getCollections(),
    getStoreInfo(),
  ]);

  return {
    colours,
    mattressBrands: brandRows.map(mapBrand),
    collections: collectionList,
    sizes: dimRows
      .filter((d) => d.isActive)
      .map((d) =>
        mapSize(d, sizeLabelById.get(d.sizeGroupOptionId) ?? "Size"),
      ),
    storeInfo,
  };
}

export async function getCollectionBySlug(slug: string) {
  return getOpsCollectionBySlug(slug);
}

/** @deprecated prefer filterProductList with preloaded products */
export async function filterProducts(
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortKey,
) {
  const [list, cats] = await Promise.all([
    getPublishedProducts(),
    getShopCategories(),
  ]);
  return filterProductList(
    list,
    categoryId,
    filters,
    sort,
    new Map(cats.map((c) => [c.id, c.name])),
  );
}

export async function searchProducts(q: string) {
  return filterProducts(undefined, { q }, "popularity");
}

/** Admin product editor — brands + option groups (uncached). */
export async function getProductEditorLookups(): Promise<ProductEditorLookups> {
  await connection();
  const [brandRows, groupRows, optionRows, dimRows, brandLinks, bedRangeRows] =
    await Promise.all([
      db.select().from(brandsTable).orderBy(asc(brandsTable.sortOrder)),
      db.select().from(optionGroups).orderBy(asc(optionGroups.sortOrder)),
      db
        .select()
        .from(options)
        .where(eq(options.isActive, true))
        .orderBy(asc(options.sortOrder)),
      db
        .select()
        .from(sizeDimensions)
        .where(eq(sizeDimensions.isActive, true))
        .orderBy(asc(sizeDimensions.sortOrder)),
      db.select().from(mattressBrandOptions),
      db
        .select()
        .from(bedRangesTable)
        .where(eq(bedRangesTable.isActive, true))
        .orderBy(asc(bedRangesTable.sortOrder)),
    ]);

  const groupIdByKey = new Map(groupRows.map((g) => [g.key, g.id]));
  const opts = (key: string) => {
    const gid = groupIdByKey.get(key);
    if (!gid) return [];
    return optionRows
      .filter((o) => o.groupId === gid)
      .map((o) => ({ id: o.id, label: o.label, slug: o.slug }));
  };

  const brandOptionIds: Record<string, string[]> = {};
  for (const link of brandLinks) {
    const list = brandOptionIds[link.brandId] ?? [];
    list.push(link.optionId);
    brandOptionIds[link.brandId] = list;
  }

  const furnitureOptionsByKey: Record<string, { id: string; label: string }[]> =
    {};
  for (const key of allCategoryConfigGroupKeys()) {
    furnitureOptionsByKey[key] = opts(key).map(({ id, label }) => ({
      id,
      label,
    }));
  }

  return {
    brands: brandRows.filter((b) => b.isActive).map(mapBrand),
    brandOptionIds,
    bedRanges: bedRangeRows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
    })),
    purpose: opts("purpose").map(({ id, label }) => ({ id, label })),
    coverMaterial: opts("cover_material").map(({ id, label }) => ({
      id,
      label,
    })),
    filling: opts("filling").map(({ id, label }) => ({ id, label })),
    comfort: opts("comfort").map(({ id, label }) => ({ id, label })),
    sizeGroups: opts("size_group"),
    thicknesses: opts("thickness"),
    colours: opts("colour"),
    sizeDimensions: dimRows.map((d) => ({
      id: d.id,
      sizeGroupOptionId: d.sizeGroupOptionId,
      label: d.label,
      lengthIn: d.lengthIn,
      widthIn: d.widthIn,
    })),
    furnitureOptionsByKey,
  };
}
