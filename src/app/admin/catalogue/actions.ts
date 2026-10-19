"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants } from "@/db/schema";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

export async function setVariantPriceAction(input: {
  variantId: string;
  price: string;
  mrp: string;
  productId?: string;
}) {
  await requireStaffProfile();
  await db
    .update(productVariants)
    .set({ price: input.price, mrp: input.mrp })
    .where(eq(productVariants.id, input.variantId));
  revalidatePath(ROUTES.admin.pricing);
  revalidatePath(ROUTES.admin.products);
  if (input.productId) {
    revalidatePath(ROUTES.admin.productEdit(input.productId));
  }
  revalidateShopCache();
  return { ok: true as const };
}

export async function setVariantStockAction(input: {
  variantId: string;
  stockQty: number;
  productId?: string;
}) {
  await requireStaffProfile();
  await db
    .update(productVariants)
    .set({ stockQty: input.stockQty })
    .where(eq(productVariants.id, input.variantId));
  revalidatePath(ROUTES.admin.stock);
  revalidatePath(ROUTES.admin.products);
  if (input.productId) {
    revalidatePath(ROUTES.admin.productEdit(input.productId));
  }
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
  await db.insert(categories).values({ name, slug, sortOrder: 99 });
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
