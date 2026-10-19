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
  mattressBrandOptions,
  mattressBrands as brandsTable,
  optionGroups,
  options,
  productCollections,
  productVariants,
  products as productsTable,
  sizeDimensions,
  type ProductVariant,
} from "@/db/schema";
import {
  mapBrand,
  mapCategory,
  mapColour,
  mapProduct,
  mapSize,
  type OptionLookup,
} from "@/services/catalogue-map";
import { getCollectionBySlug as getOpsCollectionBySlug, getCollections, getStoreInfo } from "@/services/ops";
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
      FROM product_variants
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

async function hydrateProducts(
  rows: (typeof productsTable.$inferSelect)[],
  mode: VariantMode,
): Promise<Product[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [opts, catSlugs, variantsByProduct, collectionByProduct, dimLabels] =
    await Promise.all([
      loadOptionsById(),
      loadCategorySlugById(),
      loadVariantsByProductIds(ids, mode),
      loadCollectionIdByProduct(ids),
      loadDimLabels(),
    ]);

  return rows.map((row) => {
    const product = mapProduct(
      row,
      variantsByProduct.get(row.id) ?? [],
      opts,
      catSlugs.get(row.categoryId) ?? "mattresses",
      dimLabels,
    );
    const collectionId = collectionByProduct.get(row.id);
    if (collectionId) product.collectionId = collectionId;
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
    getCategories(),
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
  const [brandRows, groupRows, optionRows, dimRows, brandLinks] =
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

  return {
    brands: brandRows.filter((b) => b.isActive).map(mapBrand),
    brandOptionIds,
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
  };
}
