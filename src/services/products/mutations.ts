import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { productCollections, products } from "@/db/schema";
import type { ProductStatus } from "@/constants/products";
import { AppError } from "@/lib/action-result";
import type { productBasicsSchema } from "@/validation/products";
import { assertBrandInCategory, assertCanPublish, isProductOrdered, pickProductSlug } from "./rules";

type BasicsData = z.output<typeof productBasicsSchema>;

/** New products start as drafts: they have no variants (prices) yet. */
export async function createProduct(data: BasicsData): Promise<{ id: string; slug: string }> {
  await assertBrandInCategory(data.brandId, data.categoryId);
  const id = crypto.randomUUID();
  const slug = await pickProductSlug(data.slug, data.name);
  const insertProduct = db.insert(products).values({
    id, slug, categoryId: data.categoryId, brandId: data.brandId, name: data.name,
    description: data.description, status: "draft", isFeatured: data.isFeatured,
  });
  if (!data.collectionIds.length) {
    await insertProduct;
    return { id, slug };
  }
  const links = data.collectionIds.map((collectionId) => ({ productId: id, collectionId }));
  await db.batch([insertProduct, db.insert(productCollections).values(links)]);
  return { id, slug };
}

async function getCategoryId(productId: string): Promise<string> {
  const [row] = await db.select({ categoryId: products.categoryId }).from(products).where(eq(products.id, productId));
  if (!row) throw new AppError("This product no longer exists");
  return row.categoryId;
}

/** Saves the Basics tab. The category never changes after create. Returns the slug actually used. */
export async function updateProductBasics(id: string, data: BasicsData): Promise<{ slug: string }> {
  const categoryId = await getCategoryId(id);
  await assertBrandInCategory(data.brandId, categoryId);
  if (data.status === "published") await assertCanPublish(id);
  const slug = await pickProductSlug(data.slug, data.name, id);
  const links = data.collectionIds.map((collectionId) => ({ productId: id, collectionId }));
  const update = db
    .update(products)
    .set({ slug, name: data.name, brandId: data.brandId, description: data.description, status: data.status, isFeatured: data.isFeatured })
    .where(eq(products.id, id));
  const clearLinks = db.delete(productCollections).where(eq(productCollections.productId, id));
  if (links.length) await db.batch([update, clearLinks, db.insert(productCollections).values(links)]);
  else await db.batch([update, clearLinks]);
  return { slug };
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  if (status === "published") await assertCanPublish(id);
  const updated = await db.update(products).set({ status }).where(eq(products.id, id)).returning({ id: products.id });
  if (!updated.length) throw new AppError("This product no longer exists");
}

/** Only products never ordered can be deleted; ordered ones are archived instead. */
export async function deleteProduct(id: string): Promise<void> {
  if (await isProductOrdered(id)) throw new AppError("This product is in orders. Archive it instead.");
  await db.delete(products).where(eq(products.id, id));
}
