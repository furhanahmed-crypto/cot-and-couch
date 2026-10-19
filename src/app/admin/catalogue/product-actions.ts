"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  optionGroups,
  options,
  productVariants,
  products,
  sizeDimensions,
} from "@/db/schema";
import {
  MATTRESS_SIZE_SKUS,
  MATTRESS_THICKNESS_SKUS,
  mattressPrice,
} from "@/data/catalogue/seed-data";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

function revalidateProduct(productId: string) {
  revalidatePath(ROUTES.admin.products);
  revalidatePath(ROUTES.admin.productEdit(productId));
  revalidateShopCache();
}

export async function archiveProductAction(productId: string) {
  await requireStaffProfile();
  await db
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, productId));
  revalidateProduct(productId);
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
      attributes: {},
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
  imageUrl?: string | null;
  mattressBrandId?: string | null;
  purposeOptionId?: string | null;
  coverMaterialOptionId?: string | null;
  fillingOptionId?: string | null;
  comfortOptionId?: string | null;
  attributes?: Record<string, string>;
}) {
  await requireStaffProfile();
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Name required" };

  const attrs = Object.fromEntries(
    Object.entries(input.attributes ?? {}).map(([k, v]) => [
      k,
      String(v ?? "").trim(),
    ]),
  );

  await db
    .update(products)
    .set({
      name,
      description: input.description.trim() || null,
      status: input.status,
      isFeatured: input.isFeatured ?? false,
      imageUrl: input.imageUrl?.trim() || null,
      mattressBrandId: input.mattressBrandId || null,
      purposeOptionId: input.purposeOptionId || null,
      coverMaterialOptionId: input.coverMaterialOptionId || null,
      fillingOptionId: input.fillingOptionId || null,
      comfortOptionId: input.comfortOptionId || null,
      attributes: attrs,
      updatedAt: new Date(),
    })
    .where(eq(products.id, input.productId));

  revalidateProduct(input.productId);
  return { ok: true as const };
}

export async function deleteProductAction(productId: string) {
  await requireStaffProfile();
  await db.delete(products).where(eq(products.id, productId));
  revalidatePath(ROUTES.admin.products);
  revalidateShopCache();
  return { ok: true as const };
}

/** Build size × thickness (mattress) or size × colour / colour SKUs for empty products. */
export async function generateProductVariantsAction(productId: string) {
  await requireStaffProfile();

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return { ok: false as const, error: "Product not found" };

  const existing = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .limit(1);
  if (existing.length) {
    return { ok: false as const, error: "Product already has variants" };
  }

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, product.categoryId))
    .limit(1);
  if (!category) return { ok: false as const, error: "Category missing" };

  const groups = await db.select().from(optionGroups);
  const opts = await db.select().from(options).where(eq(options.isActive, true));
  const dims = await db
    .select()
    .from(sizeDimensions)
    .where(eq(sizeDimensions.isActive, true));

  const groupId = (key: string) => groups.find((g) => g.key === key)?.id;
  const byGroup = (key: string) => {
    const gid = groupId(key);
    return opts.filter((o) => o.groupId === gid);
  };
  const sizeBySlug = Object.fromEntries(
    byGroup("size_group").map((o) => [o.slug, o]),
  );
  const thickBySlug = Object.fromEntries(
    byGroup("thickness").map((o) => [o.slug, o]),
  );
  const colours = byGroup("colour");
  const customSize = sizeBySlug.custom;

  function findDim(sizeSlug: string, lengthIn: number, widthIn: number) {
    const size = sizeBySlug[sizeSlug];
    if (!size) return null;
    return (
      dims.find(
        (d) =>
          d.sizeGroupOptionId === size.id &&
          d.lengthIn === lengthIn &&
          d.widthIn === widthIn,
      ) ?? null
    );
  }

  const slugBase = product.slug.slice(0, 24);
  const batch: (typeof productVariants.$inferInsert)[] = [];

  if (category.slug === "mattresses") {
    for (const sizePlan of MATTRESS_SIZE_SKUS) {
      const size = sizeBySlug[sizePlan.size];
      const dim = findDim(sizePlan.size, sizePlan.lengthIn, sizePlan.widthIn);
      if (!size || !dim) continue;
      for (const thickKey of MATTRESS_THICKNESS_SKUS) {
        const thick = thickBySlug[thickKey];
        if (!thick) continue;
        const priced = mattressPrice(sizePlan, thickKey);
        batch.push({
          productId,
          sku: [
            slugBase,
            sizePlan.size,
            `${sizePlan.lengthIn}x${sizePlan.widthIn}`,
            thickKey,
          ]
            .join("-")
            .slice(0, 80),
          sizeGroupOptionId: size.id,
          sizeDimensionId: dim.id,
          isCustomSize: false,
          thicknessOptionId: thick.id,
          colourOptionId: null,
          mrp: String(priced.mrp),
          price: String(priced.price),
          stockQty: 4,
          isActive: true,
        });
      }
    }
  } else if (category.slug === "cots") {
    if (!colours.length) {
      return { ok: false as const, error: "No colour options in masters" };
    }
    for (const sizePlan of MATTRESS_SIZE_SKUS) {
      const size = sizeBySlug[sizePlan.size];
      const dim = findDim(sizePlan.size, sizePlan.lengthIn, sizePlan.widthIn);
      if (!size || !dim) continue;
      for (const colour of colours) {
        batch.push({
          productId,
          sku: [slugBase, sizePlan.size, colour.slug].join("-").slice(0, 80),
          sizeGroupOptionId: size.id,
          sizeDimensionId: dim.id,
          isCustomSize: false,
          thicknessOptionId: null,
          colourOptionId: colour.id,
          mrp: "28999",
          price: "23999",
          stockQty: 3,
          isActive: true,
        });
      }
    }
  } else {
    // Sofas, tables, dining, etc. — colour SKUs on custom size.
    if (!customSize || !colours.length) {
      return {
        ok: false as const,
        error: "Need Custom size + colour options in masters",
      };
    }
    for (const colour of colours) {
      batch.push({
        productId,
        sku: `${slugBase}-${colour.slug}`.slice(0, 80),
        sizeGroupOptionId: customSize.id,
        sizeDimensionId: null,
        isCustomSize: true,
        thicknessOptionId: null,
        colourOptionId: colour.id,
        mrp: "39999",
        price: "34999",
        stockQty: 2,
        isActive: true,
      });
    }
  }

  if (!batch.length) {
    return { ok: false as const, error: "Could not build variants from masters" };
  }

  // Avoid SKU collisions with unique suffix if needed
  for (let i = 0; i < batch.length; i++) {
    const row = batch[i]!;
    const clash = await db
      .select({ id: productVariants.id })
      .from(productVariants)
      .where(eq(productVariants.sku, row.sku!))
      .limit(1);
    if (clash.length) {
      row.sku = `${row.sku}-${productId.slice(0, 6)}`.slice(0, 80);
    }
  }

  await db.insert(productVariants).values(batch);
  revalidateProduct(productId);
  return { ok: true as const, count: batch.length };
}
