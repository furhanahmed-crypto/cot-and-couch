/**
 * Catalogue reads from Neon. Pure helpers stay sync for client cards.
 */
import { cache } from "react";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories as categoriesTable,
  collections as collectionsTable,
  mattressBrands as brandsTable,
  optionGroups,
  options,
  productCollections,
  productVariants,
  products as productsTable,
  sizeDimensions,
  type ProductVariant,
} from "@/db/schema";
import { discountPercent } from "@/lib/format";
import {
  mapBrand,
  mapCategory,
  mapColour,
  mapProduct,
  mapSize,
  type OptionLookup,
} from "@/services/catalogue-map";
import { getCollectionBySlug as getOpsCollectionBySlug, getCollections, getStoreInfo } from "@/services/ops";
import type { Colour, Product, StockStatus } from "@/types";

export type SortKey =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "discount";

export interface FilterState {
  subCategory?: string;
  priceMin?: number;
  priceMax?: number;
  discountMin?: number;
  colours?: string[];
  materials?: string[];
  collections?: string[];
  availability?: StockStatus[];
  extra?: Record<string, string[]>;
  q?: string;
}

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

export const getCategories = cache(async (opts?: { includeHidden?: boolean }) => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(asc(categoriesTable.sortOrder));
  const mapped = rows.map(mapCategory);
  if (opts?.includeHidden) return mapped;
  return mapped.filter((c) => c.visible);
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return rows[0] ? mapCategory(rows[0]) : undefined;
});

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
export const getPublishedProducts = cache(async () => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.status, "published"))
    .orderBy(asc(productsTable.sortOrder));
  return hydrateProducts(rows, "list");
});

/** Category PLP — only that category, slim variants. */
export const getPublishedProductsByCategoryId = cache(
  async (categoryId: string) => {
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
  },
);

/** Admin — full variant matrix. */
export const getAllProducts = cache(async () => {
  const rows = await db
    .select()
    .from(productsTable)
    .orderBy(asc(productsTable.sortOrder));
  return hydrateProducts(rows, "full");
});

export async function getProductBySlug(slug: string) {
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
  const all = await getPublishedProducts();
  return all
    .filter((p) => p.featured)
    .sort((a, b) => b.popularity - a.popularity);
}

export async function getProductsByCollectionSlug(slug: string) {
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

export function startingPrice(product: Product) {
  const prices = product.variants.map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function maxDiscount(product: Product) {
  if (!product.variants.length) return 0;
  return Math.max(
    ...product.variants.map((v) => discountPercent(v.mrp, v.price)),
  );
}

export function productColours(product: Product): Colour[] {
  const map = new Map<string, Colour>();
  for (const v of product.variants) {
    if (!v.colourId || map.has(v.colourId)) continue;
    map.set(v.colourId, {
      id: v.colourId,
      name: v.colourName ?? "Colour",
      hex: v.colourHex ?? "#CCCCCC",
    });
  }
  return [...map.values()];
}

export function worstStock(product: Product): StockStatus {
  const order: StockStatus[] = [
    "out_of_stock",
    "low_stock",
    "made_to_order",
    "in_stock",
  ];
  for (const s of order) {
    if (product.variants.some((v) => v.stockStatus === s)) return s;
  }
  return "in_stock";
}

export function filterProductList(
  list: Product[],
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortKey,
  categoryNames: Map<string, string> = new Map(),
): Product[] {
  let result = list;
  if (categoryId) result = result.filter((p) => p.categoryId === categoryId);

  if (filters.subCategory) {
    result = result.filter((p) => p.subCategoryId === filters.subCategory);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((p) => {
      const cat = categoryNames.get(p.categoryId) ?? "";
      const cols = productColours(p)
        .map((c) => c.name)
        .join(" ")
        .toLowerCase();
      return [p.name, cat, p.material, cols, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    result = result.filter((p) => {
      const price = startingPrice(p);
      if (filters.priceMin != null && price < filters.priceMin) return false;
      if (filters.priceMax != null && price > filters.priceMax) return false;
      return true;
    });
  }
  if (filters.discountMin) {
    result = result.filter((p) => maxDiscount(p) >= filters.discountMin!);
  }
  if (filters.colours?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.colours!.includes(v.colourId)),
    );
  }
  if (filters.materials?.length) {
    result = result.filter((p) =>
      filters.materials!.some((m) =>
        p.material.toLowerCase().includes(m.toLowerCase()),
      ),
    );
  }
  if (filters.collections?.length) {
    result = result.filter(
      (p) => p.collectionId && filters.collections!.includes(p.collectionId),
    );
  }
  if (filters.availability?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.availability!.includes(v.stockStatus)),
    );
  }
  if (filters.extra) {
    for (const [key, values] of Object.entries(filters.extra)) {
      if (!values.length) continue;
      result = result.filter((p) =>
        values.includes(String(p.specs[key] ?? "")),
      );
    }
  }

  const sorted = [...result];
  sorted.sort((a, b) => {
    if (sort === "price_asc") return startingPrice(a) - startingPrice(b);
    if (sort === "price_desc") return startingPrice(b) - startingPrice(a);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "discount") return maxDiscount(b) - maxDiscount(a);
    return b.popularity - a.popularity;
  });
  return sorted;
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
