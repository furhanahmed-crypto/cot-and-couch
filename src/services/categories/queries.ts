import { asc, count, countDistinct, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, productVariants, products, qualities } from "@/db/schema";
import { listCategoryAddons } from "@/services/addons/queries";
import type { BrandAdminRow, CategoryAdminRow, CategoryDetail, QualityAdminRow } from "@/types/admin-catalogue";

const categoryColumns = {
  id: categories.id,
  name: categories.name,
  slug: categories.slug,
  isActive: categories.isActive,
  sortOrder: categories.sortOrder,
  productCount: count(products.id),
};

export async function listCategoriesForAdmin(): Promise<CategoryAdminRow[]> {
  return db
    .select(categoryColumns)
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder));
}

async function listQualities(categoryId: string): Promise<QualityAdminRow[]> {
  return db
    .select({
      id: qualities.id, categoryId: qualities.categoryId, name: qualities.name, slug: qualities.slug,
      description: qualities.description, warrantyYears: qualities.warrantyYears, isActive: qualities.isActive,
      sortOrder: qualities.sortOrder, productCount: countDistinct(productVariants.productId),
    })
    .from(qualities)
    .leftJoin(productVariants, eq(productVariants.qualityId, qualities.id))
    .where(eq(qualities.categoryId, categoryId))
    .groupBy(qualities.id)
    .orderBy(asc(qualities.sortOrder), asc(qualities.name));
}

async function listBrands(categoryId: string): Promise<BrandAdminRow[]> {
  return db
    .select({
      id: brands.id, categoryId: brands.categoryId, name: brands.name, slug: brands.slug,
      isActive: brands.isActive, sortOrder: brands.sortOrder, productCount: count(products.id),
    })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .where(eq(brands.categoryId, categoryId))
    .groupBy(brands.id)
    .orderBy(asc(brands.sortOrder), asc(brands.name));
}

async function listSizeLabels(categoryId: string): Promise<string[]> {
  const rows = await db
    .selectDistinct({ sizeLabel: productVariants.sizeLabel })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(products.categoryId, categoryId))
    .orderBy(asc(productVariants.sizeLabel));
  return rows.map((row) => row.sizeLabel);
}

export async function getCategoryDetail(id: string): Promise<CategoryDetail | null> {
  const [category] = await db
    .select(categoryColumns)
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(eq(categories.id, id))
    .groupBy(categories.id);
  if (!category) return null;
  const [qualityRows, brandRows, addonRows, sizeLabels] = await Promise.all([
    listQualities(id),
    listBrands(id),
    listCategoryAddons(id),
    listSizeLabels(id),
  ]);
  return { category, qualities: qualityRows, brands: brandRows, addons: addonRows, sizeLabels };
}
