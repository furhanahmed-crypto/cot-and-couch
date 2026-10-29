/**
 * Upsert bed range masters + 3 products per range (width × colour variants).
 * Prices follow showroom sheets (see bed-pricing.ts). Run after `bun run db:migrate`.
 *
 * Usage: bun run db:seed-beds
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { and, eq, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  BED_CATEGORY_SLUG,
  BED_PRODUCT_STYLES,
  BED_RANGE_SEEDS,
  BED_WIDTH_GROUP_KEY,
  BED_WIDTH_OPTIONS,
  OBSOLETE_BED_WIDTH_SLUGS,
  bedProductName,
  bedProductSlug,
} from "@/constants/bed-model";
import {
  BED_ADDON_DEFS,
  BED_ADDON_PRICES,
  BED_RANGE_PRICING,
  bedSizeKeyFromSlug,
  bedVariantPrices,
} from "@/constants/bed-pricing";
import * as schema from "./app-schema";
import { cocCategories } from "./schema-coc";
import {
  cocBedRanges,
  cocCategoryAddons,
  cocCategoryOptionGroups,
  cocCollections,
  cocOptionGroups,
  cocOptions,
  cocProductCollections,
  cocProductVariants,
  cocProducts,
} from "./schema-coc-catalogue";

const sqlClient = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

async function ensureWidthGroup(categoryId: string) {
  let [group] = await db
    .select()
    .from(cocOptionGroups)
    .where(eq(cocOptionGroups.key, BED_WIDTH_GROUP_KEY))
    .limit(1);

  if (!group) {
    [group] = await db
      .insert(cocOptionGroups)
      .values({ key: BED_WIDTH_GROUP_KEY, label: "Cot width", sortOrder: 5 })
      .returning();
  } else if (group.label !== "Cot width") {
    await db
      .update(cocOptionGroups)
      .set({ label: "Cot width" })
      .where(eq(cocOptionGroups.id, group.id));
    group = { ...group, label: "Cot width" };
  }

  const activeSlugs = BED_WIDTH_OPTIONS.map((w) => w.slug);

  for (let i = 0; i < BED_WIDTH_OPTIONS.length; i++) {
    const w = BED_WIDTH_OPTIONS[i]!;
    const [existing] = await db
      .select({ id: cocOptions.id })
      .from(cocOptions)
      .where(and(eq(cocOptions.groupId, group.id), eq(cocOptions.slug, w.slug)))
      .limit(1);
    if (existing) {
      await db
        .update(cocOptions)
        .set({ label: w.label, detail: w.detail, sortOrder: i + 1, isActive: true })
        .where(eq(cocOptions.id, existing.id));
    } else {
      await db.insert(cocOptions).values({
        groupId: group.id,
        label: w.label,
        detail: w.detail,
        slug: w.slug,
        sortOrder: i + 1,
      });
    }
  }

  await db
    .update(cocOptions)
    .set({ isActive: false })
    .where(
      and(
        eq(cocOptions.groupId, group.id),
        notInArray(cocOptions.slug, activeSlugs),
      ),
    );

  for (const slug of OBSOLETE_BED_WIDTH_SLUGS) {
    await db
      .update(cocOptions)
      .set({ isActive: false })
      .where(and(eq(cocOptions.groupId, group.id), eq(cocOptions.slug, slug)));
  }

  await db
    .insert(cocCategoryOptionGroups)
    .values({
      categoryId,
      optionGroupId: group.id,
      required: true,
      sortOrder: 0,
    })
    .onConflictDoNothing();

  const [colour] = await db
    .select()
    .from(cocOptionGroups)
    .where(eq(cocOptionGroups.key, "colour"))
    .limit(1);
  if (colour) {
    await db
      .insert(cocCategoryOptionGroups)
      .values({
        categoryId,
        optionGroupId: colour.id,
        required: false,
        sortOrder: 1,
      })
      .onConflictDoNothing();
  }

  return group.id;
}

async function ensureAddons(categoryId: string) {
  for (const def of BED_ADDON_DEFS) {
    const price = String(BED_ADDON_PRICES.standard[def.key]);
    const [existing] = await db
      .select({ id: cocCategoryAddons.id })
      .from(cocCategoryAddons)
      .where(
        and(
          eq(cocCategoryAddons.categoryId, categoryId),
          eq(cocCategoryAddons.key, def.key),
        ),
      )
      .limit(1);
    if (existing) {
      await db
        .update(cocCategoryAddons)
        .set({
          label: def.label,
          price,
          sortOrder: def.sortOrder,
          isActive: true,
        })
        .where(eq(cocCategoryAddons.id, existing.id));
    } else {
      await db.insert(cocCategoryAddons).values({
        categoryId,
        key: def.key,
        label: def.label,
        price,
        sortOrder: def.sortOrder,
        isActive: true,
      });
    }
  }
}

async function ensureRanges() {
  const bySlug = new Map<string, string>();
  for (const seed of BED_RANGE_SEEDS) {
    const pricing = BED_RANGE_PRICING[seed.slug];
    const [existing] = await db
      .select()
      .from(cocBedRanges)
      .where(eq(cocBedRanges.slug, seed.slug))
      .limit(1);
    if (existing) {
      await db
        .update(cocBedRanges)
        .set({
          name: seed.name,
          sortOrder: seed.sortOrder,
          cotType: seed.cotType,
          isActive: true,
        })
        .where(eq(cocBedRanges.id, existing.id));
      bySlug.set(seed.slug, existing.id);
    } else {
      const [row] = await db
        .insert(cocBedRanges)
        .values({
          name: seed.name,
          slug: seed.slug,
          sortOrder: seed.sortOrder,
          cotType: seed.cotType,
        })
        .returning();
      bySlug.set(seed.slug, row.id);
    }
    void pricing;
  }
  return bySlug;
}

async function rebuildVariants(
  productId: string,
  skuPrefix: string,
  rangeSlug: string,
  widthIds: { id: string; slug: string }[],
  colourIds: { id: string; slug: string }[],
) {
  await db.delete(cocProductVariants).where(eq(cocProductVariants.productId, productId));
  const rows = [];
  for (const w of widthIds) {
    const sizeKey = bedSizeKeyFromSlug(w.slug);
    const isExtra = w.slug.includes("-78x");
    const priced =
      sizeKey != null
        ? bedVariantPrices(rangeSlug, sizeKey, isExtra)
        : null;
    if (!priced) continue;

    if (colourIds.length) {
      for (const c of colourIds) {
        rows.push({
          productId,
          sku: `${skuPrefix}-${w.slug}-${c.slug}`.slice(0, 80).toUpperCase(),
          widthOptionId: w.id,
          colourOptionId: c.id,
          mrp: String(priced.mrp),
          price: String(priced.price),
          stockQty: 5,
          isActive: true,
        });
      }
    } else {
      rows.push({
        productId,
        sku: `${skuPrefix}-${w.slug}`.slice(0, 80).toUpperCase(),
        widthOptionId: w.id,
        mrp: String(priced.mrp),
        price: String(priced.price),
        stockQty: 5,
        isActive: true,
      });
    }
  }
  if (rows.length) await db.insert(cocProductVariants).values(rows);
}

async function main() {
  console.log("Seeding bed catalogue (ranges + priced products + addons)…");

  const [cat] = await db
    .select()
    .from(cocCategories)
    .where(eq(cocCategories.slug, BED_CATEGORY_SLUG))
    .limit(1);
  if (!cat) {
    console.error(`Category "${BED_CATEGORY_SLUG}" missing.`);
    process.exit(1);
  }

  const widthGroupId = await ensureWidthGroup(cat.id);
  await ensureAddons(cat.id);
  const rangeBySlug = await ensureRanges();

  const widths = await db
    .select({ id: cocOptions.id, slug: cocOptions.slug })
    .from(cocOptions)
    .where(and(eq(cocOptions.groupId, widthGroupId), eq(cocOptions.isActive, true)));

  const [colourGroup] = await db
    .select()
    .from(cocOptionGroups)
    .where(eq(cocOptionGroups.key, "colour"))
    .limit(1);
  const colours = colourGroup
    ? await db
        .select({ id: cocOptions.id, slug: cocOptions.slug })
        .from(cocOptions)
        .where(and(eq(cocOptions.groupId, colourGroup.id), eq(cocOptions.isActive, true)))
    : [];

  await db.delete(cocProducts).where(eq(cocProducts.categoryId, cat.id));

  let productCount = 0;
  const productBySlug = new Map<string, string>();

  for (const range of BED_RANGE_SEEDS) {
    const rangeId = rangeBySlug.get(range.slug)!;
    const pricing = BED_RANGE_PRICING[range.slug];
    for (let si = 0; si < BED_PRODUCT_STYLES.length; si++) {
      const style = BED_PRODUCT_STYLES[si]!;
      const name = bedProductName(range.name, style);
      const slug = bedProductSlug(range.slug, style);
      const features = pricing?.features ?? `${range.name} bed`;
      const [product] = await db
        .insert(cocProducts)
        .values({
          categoryId: cat.id,
          bedRangeId: rangeId,
          name,
          slug,
          description: `${name} — ${features}. ${pricing?.warrantyYears ?? 2} years warranty.`,
          imageUrl: `/images/cots/${range.slug}-${style.toLowerCase()}.jpg`,
          cotType: range.cotType,
          status: "published",
          isFeatured: range.sortOrder === 1 && si === 0,
          sortOrder: range.sortOrder * 10 + si + 1,
        })
        .returning();

      const skuPrefix = `COT-${range.slug.slice(0, 8)}-${style.slice(0, 4)}`;
      await rebuildVariants(product.id, skuPrefix, range.slug, widths, colours);
      productBySlug.set(slug, product.id);
      productCount++;
    }
  }

  const collections = await db.select().from(cocCollections);
  const royal = collections.find((c) => c.slug === "royal-range");
  const victoria = collections.find((c) => c.slug === "victoria");
  const range8Classic = productBySlug.get(bedProductSlug("range-8", "Classic"));
  const range7Classic = productBySlug.get(bedProductSlug("range-7", "Classic"));

  if (royal && range8Classic) {
    await db.insert(cocProductCollections).values({
      productId: range8Classic,
      collectionId: royal.id,
    });
  }
  if (victoria && range7Classic) {
    await db.insert(cocProductCollections).values({
      productId: range7Classic,
      collectionId: victoria.id,
    });
  }

  console.log(
    `Done. ${BED_RANGE_SEEDS.length} ranges, ${productCount} products, ${widths.length} widths × ${colours.length || 1} colour(s), ${BED_ADDON_DEFS.length} addons.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
