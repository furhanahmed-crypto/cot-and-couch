import { and, asc, count, countDistinct, desc, eq, exists, ilike, inArray, max, min, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, productImages, productVariants, products } from "@/db/schema";
import { clampPage, getPageOffset, PAGE_SIZE } from "@/lib/list-params";
import { toRupeesOrNull } from "@/lib/money";
import { escapeLikePattern } from "@/services/catalogue/product-card-queries";
import type { ProductAdminFilters, ProductAdminRow, ProductAdminSort } from "@/types/admin-products";
import type { Page } from "@/types/pagination";

function variantExists(condition: SQL) {
  return exists(
    db.select({ one: sql`1` }).from(productVariants).where(and(eq(productVariants.productId, products.id), condition)),
  );
}

/** Search matches the product name or any of its SKUs. */
function buildWhere(filters: ProductAdminFilters): SQL | undefined {
  const pattern = `%${escapeLikePattern(filters.q)}%`;
  return and(
    filters.q ? or(ilike(products.name, pattern), variantExists(ilike(productVariants.sku, pattern))) : undefined,
    filters.categoryId ? eq(products.categoryId, filters.categoryId) : undefined,
    filters.status ? eq(products.status, filters.status) : undefined,
    filters.brandId ? eq(products.brandId, filters.brandId) : undefined,
    filters.qualityId ? variantExists(eq(productVariants.qualityId, filters.qualityId)) : undefined,
  );
}

const minPrice = min(productVariants.price);

function orderFor(sort: ProductAdminSort) {
  if (sort === "name") return [asc(products.name)];
  if (sort === "price") return [sql`${minPrice} asc nulls last`, asc(products.name)];
  if (sort === "updated") return [desc(products.updatedAt)];
  // Shop order: category by category, then each product's order number.
  return [asc(categories.sortOrder), asc(products.sortOrder), asc(products.name)];
}

async function listFirstImages(productIds: string[]): Promise<Map<string, string>> {
  if (!productIds.length) return new Map();
  const rows = await db
    .select({ productId: productImages.productId, url: productImages.url })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder));
  const firstByProduct = new Map<string, string>();
  for (const row of rows) if (!firstByProduct.has(row.productId)) firstByProduct.set(row.productId, row.url);
  return firstByProduct;
}

export async function listProductsForAdmin(filters: ProductAdminFilters): Promise<Page<ProductAdminRow>> {
  const where = buildWhere(filters);
  const [totalRow] = await db.select({ total: count() }).from(products).where(where);
  const total = totalRow?.total ?? 0;
  const page = clampPage(filters.page, total);

  const rows = await db
    .select({
      id: products.id, name: products.name, slug: products.slug, status: products.status, updatedAt: products.updatedAt,
      categoryName: categories.name, brandName: brands.name,
      variantCount: countDistinct(productVariants.id), minPrice, maxPrice: max(productVariants.price),
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(productVariants, eq(productVariants.productId, products.id))
    .where(where)
    .groupBy(products.id, categories.name, categories.sortOrder, brands.name)
    .orderBy(...orderFor(filters.sort))
    .limit(PAGE_SIZE)
    .offset(getPageOffset(page));

  const images = await listFirstImages(rows.map((row) => row.id));
  const items = rows.map((row) => ({
    ...row,
    imageUrl: images.get(row.id) ?? null,
    minPrice: toRupeesOrNull(row.minPrice),
    maxPrice: toRupeesOrNull(row.maxPrice),
    updatedAt: row.updatedAt.toISOString(),
  }));
  return { items, total, page, pageSize: PAGE_SIZE };
}
