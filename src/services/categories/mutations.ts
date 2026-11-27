import { and, count, countDistinct, eq, ne } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { brands, categories, productVariants, products, qualities } from "@/db/schema";
import { assertNotInUse } from "@/lib/in-use";
import { makeUniqueSlug, toSlug } from "@/lib/slug";
import type { brandFormSchema, categoryFormSchema, qualityFormSchema } from "@/validation/catalogue";

type CategoryData = z.output<typeof categoryFormSchema>;
type QualityData = z.output<typeof qualityFormSchema>;
type BrandData = z.output<typeof brandFormSchema>;

/** Name, active and order only: the slug is fixed because code depends on it. */
export async function updateCategory(id: string, data: CategoryData): Promise<void> {
  await db.update(categories).set(data).where(eq(categories.id, id));
}

/** A slug from the name that no other row in this category uses. */
async function pickSlug(table: typeof qualities | typeof brands, categoryId: string, name: string, ownId?: string) {
  const ownFilter = ownId ? ne(table.id, ownId) : undefined;
  const rows = await db.select({ slug: table.slug }).from(table).where(and(eq(table.categoryId, categoryId), ownFilter));
  return makeUniqueSlug(toSlug(name), rows.map((row) => row.slug));
}

export async function createQuality(data: QualityData): Promise<void> {
  const slug = await pickSlug(qualities, data.categoryId, data.name);
  await db.insert(qualities).values({ ...data, slug });
}

/** The category of a quality never changes. */
export async function updateQuality(id: string, data: QualityData): Promise<void> {
  const { categoryId, ...changes } = data;
  const slug = await pickSlug(qualities, categoryId, data.name, id);
  await db.update(qualities).set({ ...changes, slug }).where(eq(qualities.id, id));
}

export async function deleteQuality(id: string): Promise<void> {
  const [row] = await db
    .select({ total: countDistinct(productVariants.productId) })
    .from(productVariants)
    .where(eq(productVariants.qualityId, id));
  assertNotInUse(row?.total ?? 0);
  await db.delete(qualities).where(eq(qualities.id, id));
}

export async function createBrand(data: BrandData): Promise<void> {
  const slug = await pickSlug(brands, data.categoryId, data.name);
  await db.insert(brands).values({ ...data, slug });
}

export async function updateBrand(id: string, data: BrandData): Promise<void> {
  const { categoryId, ...changes } = data;
  const slug = await pickSlug(brands, categoryId, data.name, id);
  await db.update(brands).set({ ...changes, slug }).where(eq(brands.id, id));
}

export async function deleteBrand(id: string): Promise<void> {
  const [row] = await db.select({ total: count() }).from(products).where(eq(products.brandId, id));
  assertNotInUse(row?.total ?? 0);
  await db.delete(brands).where(eq(brands.id, id));
}
