import { and, count, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { brands, orderItems, productVariants, products } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { makeUniqueSlug, toSlug } from "@/lib/slug";

/** A product can be published only with at least one active variant (a price to show). */
export async function assertCanPublish(productId: string): Promise<void> {
  const [row] = await db
    .select({ total: count() })
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)));
  if (!row?.total) throw new AppError("Add at least one active variant first");
}

export async function assertBrandInCategory(brandId: string | null, categoryId: string): Promise<void> {
  if (!brandId) return;
  const [brand] = await db.select({ categoryId: brands.categoryId }).from(brands).where(eq(brands.id, brandId));
  if (brand?.categoryId !== categoryId) throw new AppError("This brand is not in the product's category");
}

/** The wanted slug (or one from the name), with -2, -3… if another product has it. */
export async function pickProductSlug(wanted: string, name: string, ownId?: string): Promise<string> {
  const base = wanted || toSlug(name);
  if (!base) throw new AppError("Name must contain letters or numbers");
  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(ownId ? ne(products.id, ownId) : undefined);
  return makeUniqueSlug(base, rows.map((row) => row.slug));
}

/** True when any variant of the product appears in an order. */
export async function isProductOrdered(productId: string): Promise<boolean> {
  const [row] = await db
    .select({ total: count() })
    .from(orderItems)
    .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .where(eq(productVariants.productId, productId));
  return (row?.total ?? 0) > 0;
}

export async function isVariantOrdered(variantId: string): Promise<boolean> {
  const [row] = await db.select({ total: count() }).from(orderItems).where(eq(orderItems.variantId, variantId));
  return (row?.total ?? 0) > 0;
}
