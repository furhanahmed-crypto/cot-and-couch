import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, collections, qualities } from "@/db/schema";
import type { ProductFilterOptions } from "@/types/admin-products";

/** Brand and quality filters only make sense once a category is chosen. */
export async function getProductFilterOptions(categoryId: string | null): Promise<ProductFilterOptions> {
  const [categoryRows, brandRows, qualityRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    categoryId
      ? db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.categoryId, categoryId)).orderBy(asc(brands.sortOrder))
      : Promise.resolve([]),
    categoryId
      ? db.select({ id: qualities.id, name: qualities.name }).from(qualities).where(eq(qualities.categoryId, categoryId)).orderBy(asc(qualities.sortOrder))
      : Promise.resolve([]),
  ]);
  return { categories: categoryRows, brands: brandRows, qualities: qualityRows };
}

/** Choices for the "Add product" form: categories, their brands, and collections. */
export async function getNewProductChoices() {
  const [categoryRows, brandRows, collectionRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select({ id: brands.id, name: brands.name, categoryId: brands.categoryId })
      .from(brands)
      .where(eq(brands.isActive, true))
      .orderBy(asc(brands.sortOrder)),
    db.select({ id: collections.id, name: collections.name }).from(collections).orderBy(asc(collections.sortOrder)),
  ]);
  const brandsByCategory: Record<string, { id: string; name: string }[]> = {};
  for (const brand of brandRows) {
    brandsByCategory[brand.categoryId] = [...(brandsByCategory[brand.categoryId] ?? []), { id: brand.id, name: brand.name }];
  }
  return { categories: categoryRows, brandsByCategory, collections: collectionRows };
}
