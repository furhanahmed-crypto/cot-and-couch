/**
 * Normalise beds: 8 range products, 4 width variants, Royal/Victoria tags.
 * Run after `bun run db:migrate` (includes 0007_bed_model_cleanup.sql).
 *
 * Usage: bun run db:migrate-bed-ranges
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { and, eq, inArray, notInArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  BED_CATEGORY_SLUG,
  BED_RANGE_COUNT,
  BED_WIDTH_GROUP_KEY,
  BED_RANGE_NAMES,
  BED_WIDTH_OPTIONS,
  bedCotTypeForRange,
} from "@/constants/bed-model";
import {
  cocCategoryOptionGroups,
  cocCollections,
  cocOptionGroups,
  cocOptions,
  cocProductCollections,
  cocProductVariants,
  cocProducts,
} from "./schema-coc-catalogue";
import { cocCategories } from "./schema-coc";

const sqlClient = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!);
const db = drizzle(sqlClient);

async function optionGroupIdByKey(key: string) {
  const [row] = await db
    .select({ id: cocOptionGroups.id })
    .from(cocOptionGroups)
    .where(eq(cocOptionGroups.key, key))
    .limit(1);
  return row?.id ?? null;
}

async function ensureBedWidths(categoryId: string) {
  let groupId = await optionGroupIdByKey(BED_WIDTH_GROUP_KEY);
  if (!groupId) {
    const [g] = await db
      .insert(cocOptionGroups)
      .values({ key: BED_WIDTH_GROUP_KEY, label: "Bed width", sortOrder: 5 })
      .returning({ id: cocOptionGroups.id });
    groupId = g.id;
  }

  for (let i = 0; i < BED_WIDTH_OPTIONS.length; i++) {
    const w = BED_WIDTH_OPTIONS[i]!;
    const existing = await db
      .select({ id: cocOptions.id })
      .from(cocOptions)
      .where(and(eq(cocOptions.groupId, groupId), eq(cocOptions.slug, w.slug)))
      .limit(1);
    if (!existing[0]) {
      await db.insert(cocOptions).values({
        groupId,
        label: w.label,
        detail: w.detail,
        slug: w.slug,
        sortOrder: i + 1,
      });
    }
  }

  await db
    .insert(cocCategoryOptionGroups)
    .values({
      categoryId,
      optionGroupId: groupId,
      required: true,
      sortOrder: 0,
    })
    .onConflictDoNothing();

  const colourGroupId = await optionGroupIdByKey("colour");
  if (colourGroupId) {
    await db
      .insert(cocCategoryOptionGroups)
      .values({
        categoryId,
        optionGroupId: colourGroupId,
        required: false,
        sortOrder: 1,
      })
      .onConflictDoNothing();
  }

  return db.select().from(cocOptions).where(eq(cocOptions.groupId, groupId));
}

async function ensureRangeProducts(categoryId: string) {
  const rangeProducts: { id: string; rangeNumber: number }[] = [];

  for (let range = 1; range <= BED_RANGE_COUNT; range++) {
    const slug = `cot-range-${range}`;
    const [existing] = await db
      .select({ id: cocProducts.id })
      .from(cocProducts)
      .where(eq(cocProducts.slug, slug))
      .limit(1);

    const displayName = BED_RANGE_NAMES[range] ?? `Range ${range}`;

    if (existing) {
      await db
        .update(cocProducts)
        .set({
          categoryId,
          name: displayName,
          rangeNumber: range,
          cotType: bedCotTypeForRange(range),
          status: "published",
          sortOrder: range,
          updatedAt: new Date(),
        })
        .where(eq(cocProducts.id, existing.id));
      rangeProducts.push({ id: existing.id, rangeNumber: range });
      continue;
    }

    const [inserted] = await db
      .insert(cocProducts)
      .values({
        categoryId,
        name: displayName,
        slug,
        rangeNumber: range,
        cotType: bedCotTypeForRange(range),
        status: "published",
        sortOrder: range,
      })
      .returning({ id: cocProducts.id });
    rangeProducts.push({ id: inserted.id, rangeNumber: range });
  }

  return rangeProducts;
}

async function archiveLegacyBeds(categoryId: string, rangeIds: string[]) {
  if (rangeIds.length === 0) return;
  await db
    .update(cocProducts)
    .set({ status: "archived", updatedAt: new Date() })
    .where(
      and(
        eq(cocProducts.categoryId, categoryId),
        notInArray(cocProducts.id, rangeIds),
      ),
    );
}

async function rebuildVariants(
  rangeProducts: { id: string; rangeNumber: number }[],
  widthOptions: { id: string; slug: string }[],
) {
  const colourGroupId = await optionGroupIdByKey("colour");
  const colours = colourGroupId
    ? await db
        .select({ id: cocOptions.id, slug: cocOptions.slug })
        .from(cocOptions)
        .where(and(eq(cocOptions.groupId, colourGroupId), eq(cocOptions.isActive, true)))
    : [];

  for (const p of rangeProducts) {
    await db.delete(cocProductVariants).where(eq(cocProductVariants.productId, p.id));

    if (colours.length) {
      for (const w of widthOptions) {
        for (const colour of colours) {
          await db.insert(cocProductVariants).values({
            productId: p.id,
            sku: `COT-R${p.rangeNumber}-${w.slug}-${colour.slug}`.slice(0, 80).toUpperCase(),
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
      for (const w of widthOptions) {
        await db.insert(cocProductVariants).values({
          productId: p.id,
          sku: `COT-R${p.rangeNumber}-${w.slug}`.slice(0, 80).toUpperCase(),
          widthOptionId: w.id,
          mrp: "0",
          price: "0",
          stockQty: 0,
          isActive: true,
        });
      }
    }
  }
}

async function assignCollections(rangeProducts: { id: string; rangeNumber: number }[]) {
  const byRange = new Map(rangeProducts.map((p) => [p.rangeNumber, p.id]));
  const bedIds = rangeProducts.map((p) => p.id);

  const collections = await db.select().from(cocCollections);
  const royal = collections.find((c) => c.slug === "royal-range");
  const victoria = collections.find((c) => c.slug === "victoria");
  if (!royal || !victoria) {
    console.warn("Royal Range / Victoria collections missing — skip collection tags.");
    return;
  }

  await db
    .delete(cocProductCollections)
    .where(inArray(cocProductCollections.productId, bedIds));

  const royalId = byRange.get(8);
  const victoriaId = byRange.get(7);
  if (royalId) {
    await db.insert(cocProductCollections).values({
      productId: royalId,
      collectionId: royal.id,
    });
  }
  if (victoriaId && victoriaId !== royalId) {
    await db.insert(cocProductCollections).values({
      productId: victoriaId,
      collectionId: victoria.id,
    });
  }
}

async function main() {
  console.log("Bed ranges migration…");

  const [cat] = await db
    .select()
    .from(cocCategories)
    .where(eq(cocCategories.slug, BED_CATEGORY_SLUG))
    .limit(1);
  if (!cat) {
    console.error(`Category slug "${BED_CATEGORY_SLUG}" not found.`);
    process.exit(1);
  }

  const widthOptions = await ensureBedWidths(cat.id);
  const rangeProducts = await ensureRangeProducts(cat.id);
  const rangeIds = rangeProducts.map((p) => p.id);

  await archiveLegacyBeds(cat.id, rangeIds);
  await rebuildVariants(rangeProducts, widthOptions);
  await assignCollections(rangeProducts);

  const published = await db
    .select({ id: cocProducts.id })
    .from(cocProducts)
    .where(and(eq(cocProducts.categoryId, cat.id), eq(cocProducts.status, "published")));
  console.log(
    `Done. ${published.length} published bed products, ${rangeProducts.length} ranges, collections on Range 7 (Victoria) & Range 8 (Royal Range).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
