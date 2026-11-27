import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, colours, productVariants, products, qualities } from "@/db/schema";
import { tagShopCache } from "@/lib/cache-tags";
import type { BrandItem, CategoryItem, ColourItem, QualityItem } from "@/types/catalogue";
import { toCategoryItem, toQualityItem } from "./mappers";

export type CategoryFacets = {
  qualities: QualityItem[];
  brands: BrandItem[];
  colours: ColourItem[];
};

export async function listCategories(): Promise<CategoryItem[]> {
  "use cache";
  tagShopCache();
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));
  return rows.map(toCategoryItem);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  "use cache";
  tagShopCache();
  const [row] = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);
  return row ? toCategoryItem(row) : null;
}

/** Variant ids of published products in a category (subquery for facets). */
function publishedVariantsIn(categoryId: string) {
  return db
    .select({ id: productVariants.id })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(
      and(eq(products.categoryId, categoryId), eq(products.status, "published"), eq(productVariants.isActive, true)),
    );
}

/** Filter options for a category page: only values some published product uses. */
export async function getCategoryFacets(categoryId: string): Promise<CategoryFacets> {
  "use cache";
  tagShopCache();
  const variantIds = publishedVariantsIn(categoryId);
  const [qualityRows, brandRows, colourRows] = await Promise.all([
    db
      .selectDistinct({
        id: qualities.id, name: qualities.name, slug: qualities.slug, description: qualities.description,
        warrantyYears: qualities.warrantyYears, sortOrder: qualities.sortOrder,
      })
      .from(qualities)
      .innerJoin(productVariants, eq(productVariants.qualityId, qualities.id))
      .where(and(eq(qualities.isActive, true), inArray(productVariants.id, variantIds)))
      .orderBy(asc(qualities.sortOrder)),
    db
      .selectDistinct({ id: brands.id, name: brands.name, slug: brands.slug, sortOrder: brands.sortOrder })
      .from(brands)
      .innerJoin(products, eq(products.brandId, brands.id))
      .where(and(eq(brands.isActive, true), eq(products.categoryId, categoryId), eq(products.status, "published")))
      .orderBy(asc(brands.sortOrder)),
    db
      .selectDistinct({ id: colours.id, name: colours.name, hex: colours.hex, sortOrder: colours.sortOrder })
      .from(colours)
      .innerJoin(productVariants, eq(productVariants.colourId, colours.id))
      .where(and(isNotNull(productVariants.colourId), inArray(productVariants.id, variantIds)))
      .orderBy(asc(colours.sortOrder)),
  ]);
  return {
    qualities: qualityRows.map(toQualityItem),
    brands: brandRows.map(({ id, name, slug }) => ({ id, name, slug })),
    colours: colourRows.map(({ id, name, hex }) => ({ id, name, hex })),
  };
}
