import { and, asc, eq, ilike, inArray, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  brands,
  categories,
  colours,
  productCollections,
  productImages,
  productSpecs,
  productVariants,
  products,
} from "@/db/schema";
import { tagShopCache } from "@/lib/cache-tags";
import type { ProductCardItem } from "@/types/catalogue";
import { toCardVariant, uniqueColours } from "./mappers";

type ProductBaseRow = Awaited<ReturnType<typeof selectPublishedProducts>>[number];

const SEARCH_LIMIT = 40;

function selectPublishedProducts(where?: SQL) {
  return db
    .select({
      id: products.id, slug: products.slug, name: products.name, isFeatured: products.isFeatured,
      sortOrder: products.sortOrder, createdAt: products.createdAt, brandId: products.brandId,
      brandName: brands.name, categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(products.status, "published"), eq(categories.isActive, true), where))
    .orderBy(asc(products.sortOrder));
}

/** Adds variants, first image, specs, colours and collections to product rows. */
async function toProductCards(rows: ProductBaseRow[]): Promise<ProductCardItem[]> {
  const ids = rows.map((row) => row.id);
  if (!ids.length) return [];
  const [variantRows, imageRows, specRows, collectionRows] = await Promise.all([
    db
      .select({ variant: productVariants, colour: { id: colours.id, name: colours.name, hex: colours.hex } })
      .from(productVariants)
      .leftJoin(colours, eq(colours.id, productVariants.colourId))
      .where(and(inArray(productVariants.productId, ids), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.sortOrder)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productSpecs).where(inArray(productSpecs.productId, ids)),
    db.select().from(productCollections).where(inArray(productCollections.productId, ids)),
  ]);

  const cards = rows.map((row) => {
    const variants = variantRows.filter((item) => item.variant.productId === row.id);
    return {
      ...row,
      createdAt: row.createdAt.toISOString(),
      imageUrl: imageRows.find((image) => image.productId === row.id)?.url ?? null,
      specs: Object.fromEntries(
        specRows.filter((spec) => spec.productId === row.id).map((spec) => [spec.label, spec.value]),
      ),
      collectionIds: collectionRows.filter((link) => link.productId === row.id).map((link) => link.collectionId),
      colours: uniqueColours(variants.map((item) => item.colour)),
      variants: variants.map((item) => toCardVariant(item.variant)),
    };
  });
  // A product with no active variant has no price, so it is not listed.
  return cards.filter((card) => card.variants.length > 0);
}

export async function listProductCardsByCategory(categoryId: string): Promise<ProductCardItem[]> {
  "use cache";
  tagShopCache();
  return toProductCards(await selectPublishedProducts(eq(products.categoryId, categoryId)));
}

export async function listFeaturedProductCards(): Promise<ProductCardItem[]> {
  "use cache";
  tagShopCache();
  return toProductCards(await selectPublishedProducts(eq(products.isFeatured, true)));
}

export async function listProductCardsByCollection(collectionId: string): Promise<ProductCardItem[]> {
  "use cache";
  tagShopCache();
  const inCollection = db
    .select({ id: productCollections.productId })
    .from(productCollections)
    .where(eq(productCollections.collectionId, collectionId));
  return toProductCards(await selectPublishedProducts(inArray(products.id, inCollection)));
}

/** Cards in the same order as `ids` (recently viewed, shortlist). */
export async function listProductCardsByIds(ids: string[]): Promise<ProductCardItem[]> {
  if (!ids.length) return [];
  const cards = await toProductCards(await selectPublishedProducts(inArray(products.id, ids)));
  return ids.flatMap((id) => cards.find((card) => card.id === id) ?? []);
}

/** `%` and `_` are wildcards in ilike: escape them so they match literally. */
export function escapeLikePattern(text: string): string {
  return text.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function searchProductCards(query: string): Promise<ProductCardItem[]> {
  const text = query.trim();
  if (!text) return [];
  const rows = await selectPublishedProducts(ilike(products.name, `%${escapeLikePattern(text)}%`));
  return toProductCards(rows.slice(0, SEARCH_LIMIT));
}
