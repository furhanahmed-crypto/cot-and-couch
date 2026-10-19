"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

export async function archiveProductAction(productId: string) {
  await requireStaffProfile();
  await db
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, productId));
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
  return { ok: true as const };
}

export async function createProductAction(input: {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  mattressBrandId?: string | null;
}) {
  await requireStaffProfile();
  const name = input.name.trim();
  const slug = input.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!name || !slug || !input.categoryId) {
    return { ok: false as const, error: "Name, slug, category required" };
  }
  const [row] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      name,
      slug,
      description: input.description?.trim() || null,
      mattressBrandId: input.mattressBrandId || null,
      status: "draft",
    })
    .returning({ id: products.id });
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
  return { ok: true as const, id: row.id };
}

export async function updateProductAction(input: {
  productId: string;
  name: string;
  description: string;
  status: "draft" | "published" | "archived";
  isFeatured?: boolean;
}) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };
  await db
    .update(products)
    .set({
      name,
      description: input.description.trim() || null,
      status: input.status,
      isFeatured: input.isFeatured ?? false,
      updatedAt: new Date(),
    })
    .where(eq(products.id, input.productId));
  revalidatePath(ROUTES.admin.products);
  revalidatePath(ROUTES.admin.productEdit(input.productId));
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteProductAction(productId: string) {
  await requireStaffProfile();
  await db.delete(products).where(eq(products.id, productId));
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
  return { ok: true as const };
}
