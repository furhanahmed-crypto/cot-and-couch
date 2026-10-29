"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  optionGroups,
  options,
  productOptionValues,
  productVariants,
  products,
  sizeDimensions,
} from "@/db";
import {
  MATTRESS_SIZE_SKUS,
  MATTRESS_THICKNESS_SKUS,
  mattressPrice,
} from "@/data/catalogue/seed-data";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";
import { BED_WIDTH_GROUP_KEY } from "@/constants/bed-model";

function revalidateProduct(productId: string) {
  revalidatePath(ROUTES.admin.products);
  revalidatePath(ROUTES.admin.productEdit(productId));
  revalidateShopCache();
}

async function upsertProductOption(
  productId: string,
  groupKey: string,
  optionId: string | null | undefined,
) {
  const [group] = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, groupKey))
    .limit(1);
  if (!group) return;

  await db
    .delete(productOptionValues)
    .where(
      and(
        eq(productOptionValues.productId, productId),
        eq(productOptionValues.optionGroupId, group.id),
      ),
    );

  if (optionId) {
    await db.insert(productOptionValues).values({
      productId,
      optionGroupId: group.id,
      optionId,
      textValue: null,
    });
  }
}

async function upsertProductTextOption(
  productId: string,
  groupKey: string,
  textValue: string,
) {
  const [group] = await db
    .select({ id: optionGroups.id })
    .from(optionGroups)
    .where(eq(optionGroups.key, groupKey))
    .limit(1);
  if (!group) return;

  await db
    .delete(productOptionValues)
    .where(
      and(
        eq(productOptionValues.productId, productId),
        eq(productOptionValues.optionGroupId, group.id),
      ),
    );

  const trimmed = textValue.trim();
  if (trimmed) {
    await db.insert(productOptionValues).values({
      productId,
      optionGroupId: group.id,
      optionId: null,
      textValue: trimmed,
    });
  }
}

async function syncProductSpecs(
  productId: string,
  input: {
    purposeOptionId?: string | null;
    coverMaterialOptionId?: string | null;
    fillingOptionId?: string | null;
    comfortOptionId?: string | null;
    attributes?: Record<string, string>;
  },
) {
  await upsertProductOption(productId, "purpose", input.purposeOptionId);
  await upsertProductOption(productId, "cover_material", input.coverMaterialOptionId);
  await upsertProductOption(productId, "filling", input.fillingOptionId);
  await upsertProductOption(productId, "comfort", input.comfortOptionId);

  for (const [key, value] of Object.entries(input.attributes ?? {})) {
    if (["purpose", "cover_material", "filling", "comfort"].includes(key)) {
      continue;
    }
    await upsertProductTextOption(productId, key, String(value ?? ""));
  }
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
  bedRangeId?: string | null;
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
  const [cat] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, input.categoryId))
    .limit(1);
  if (cat?.slug === "cots" && !input.bedRangeId) {
    return { ok: false as const, error: "Choose a bed range" };
  }
  const [row] = await db
    .insert(products)
    .values({
      categoryId: input.categoryId,
      name,
      slug,
      description: input.description?.trim() || null,
      mattressBrandId: input.mattressBrandId || null,
      bedRangeId: input.bedRangeId || null,
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
  imageUrl?: string | null;
  mattressBrandId?: string | null;
  bedRangeId?: string | null;
  purposeOptionId?: string | null;
  coverMaterialOptionId?: string | null;
  fillingOptionId?: string | null;
  comfortOptionId?: string | null;
  attributes?: Record<string, string>;
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
      imageUrl: input.imageUrl?.trim() || null,
      mattressBrandId: input.mattressBrandId || null,
      bedRangeId: input.bedRangeId || null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, input.productId));

  await syncProductSpecs(input.productId, input);

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
    const widths = byGroup(BED_WIDTH_GROUP_KEY);
    if (!widths.length) {
      return {
        ok: false as const,
        error: "Add bed widths under Categories → Beds → Manage options",
      };
    }
    const prefix = slugBase.toUpperCase();
    if (colours.length) {
      for (const w of widths) {
        for (const colour of colours) {
          batch.push({
            productId,
            sku: `${prefix}-${w.slug}-${colour.slug}`.slice(0, 80).toUpperCase(),
            widthOptionId: w.id,
            colourOptionId: colour.id,
            mrp: "0",
            price: "0",
            stockQty: 0,
            isActive: true,
          });
        }
      }
    } else {
      for (const w of widths) {
        batch.push({
          productId,
          sku: `${prefix}-${w.slug}`.slice(0, 80).toUpperCase(),
          widthOptionId: w.id,
          mrp: "0",
          price: "0",
          stockQty: 0,
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
