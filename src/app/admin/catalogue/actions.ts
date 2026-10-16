"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";
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

export async function setVariantPriceAction(input: {
  variantId: string;
  price: string;
  mrp: string;
}) {
  await requireStaffProfile();
  await db
    .update(productVariants)
    .set({
      price: input.price,
      mrp: input.mrp,
    })
    .where(eq(productVariants.id, input.variantId));
  revalidatePath(ROUTES.admin.pricing);
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
  return { ok: true as const };
}

export async function setVariantStockAction(input: {
  variantId: string;
  stockQty: number;
}) {
  await requireStaffProfile();
  await db
    .update(productVariants)
    .set({ stockQty: input.stockQty })
    .where(eq(productVariants.id, input.variantId));
  revalidatePath(ROUTES.admin.stock);
  revalidateShopCache();
  return { ok: true as const };
}

export async function setCategoryActiveAction(input: {
  categoryId: string;
  isActive: boolean;
}) {
  await requireStaffProfile();
  await db
    .update(categories)
    .set({ isActive: input.isActive })
    .where(eq(categories.id, input.categoryId));
  revalidatePath(ROUTES.admin.categories);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function renameCategoryAction(input: {
  categoryId: string;
  name: string;
}) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };
  await db
    .update(categories)
    .set({ name })
    .where(eq(categories.id, input.categoryId));
  revalidatePath(ROUTES.admin.categories);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function createCategoryAction(input: { name: string; slug: string }) {
  await requireStaffProfile();
  const name = input.name.trim();
  const slug = input.slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!name || !slug) return { ok: false as const, error: "Name and slug required" };
  await db.insert(categories).values({
    name,
    slug,
    sortOrder: 99,
  });
  revalidatePath(ROUTES.admin.categories);
  revalidatePath("/");
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireStaffProfile();
  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
  } catch {
    return {
      ok: false as const,
      error: "Category has products — hide it instead of deleting",
    };
  }
  revalidatePath(ROUTES.admin.categories);
  revalidatePath("/");
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
  await db.insert(products).values({
    categoryId: input.categoryId,
    name,
    slug,
    description: input.description?.trim() || null,
    mattressBrandId: input.mattressBrandId || null,
    status: "draft",
  });
  revalidatePath(ROUTES.admin.products);
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
