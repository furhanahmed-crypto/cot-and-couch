/**
 * Seed catalogue from src/data/catalogue/seed-data.ts
 * Run: npm run db:seed
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./app-schema";
import { categoryConfigSeedRows } from "@/constants/category-config";
import {
  MATTRESS_BRANDS,
  CATEGORIES,
  COLOURS,
  COMFORTS,
  COT_MODELS,
  COT_VARIANT_PLANS,
  COVER_MATERIALS,
  FILLINGS,
  MATTRESS_MODELS,
  PURPOSES,
  SIZE_DIMENSIONS,
  SIZE_GROUPS,
  SOFA_MODELS,
  SOFA_VARIANT_PRICE,
  TABLE_MODELS,
  TABLE_VARIANT_PRICE,
  THICKNESSES,
  houseImagePath,
  houseProductSlug,
  mattressImagePath,
  mattressPrice,
  MATTRESS_SIZE_SKUS,
  MATTRESS_THICKNESS_SKUS,
  productSlug,
} from "@/data/catalogue/seed-data";
import { seedOps } from "./seed-ops";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

type VariantInsert = typeof schema.productVariants.$inferInsert;

async function insertVariants(rows: VariantInsert[]) {
  const chunk = 150;
  for (let i = 0; i < rows.length; i += chunk) {
    await db.insert(schema.productVariants).values(rows.slice(i, i + chunk));
  }
}

async function clearCatalogue() {
  await db.delete(schema.productVariants);
  await db.delete(schema.productOptionValues);
  await db.delete(schema.products);
  await db.delete(schema.sizeDimensions);
  await db.delete(schema.mattressBrandOptions);
  await db.delete(schema.options);
  await db.delete(schema.optionGroups);
  await db.delete(schema.mattressBrands);
  await db.delete(schema.categories);
}

async function addOptions(
  groupId: string,
  items: readonly { label: string; slug: string; hex?: string }[],
) {
  return db
    .insert(schema.options)
    .values(
      items.map((item, i) => ({
        groupId,
        label: item.label,
        slug: item.slug,
        hex: "hex" in item ? (item.hex ?? null) : null,
        sortOrder: i + 1,
      })),
    )
    .returning();
}

async function syncProductOptions(
  productId: string,
  rows: { optionGroupId: string; optionId: string }[],
) {
  if (!rows.length) return;
  await db.insert(schema.productOptionValues).values(
    rows.map((r) => ({
      productId,
      optionGroupId: r.optionGroupId,
      optionId: r.optionId,
    })),
  );
}

async function seed() {
  console.log("Seeding catalogue…");
  await clearCatalogue();

  const cats = await db
    .insert(schema.categories)
    .values(
      CATEGORIES.map((c) => ({
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
      })),
    )
    .returning();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  const mattressBrandRows = await db
    .insert(schema.mattressBrands)
    .values(
      MATTRESS_BRANDS.map((b) => ({
        name: b.name,
        slug: b.slug,
        sortOrder: b.sortOrder,
      })),
    )
    .returning();
  const mattressBrandBySlug = Object.fromEntries(mattressBrandRows.map((b) => [b.slug, b]));

  const groups = await db
    .insert(schema.optionGroups)
    .values([
      { key: "purpose", label: "Purpose", sortOrder: 1 },
      { key: "size_group", label: "Size", sortOrder: 2 },
      { key: "thickness", label: "Thickness", sortOrder: 3 },
      { key: "cover_material", label: "Cover material", sortOrder: 4 },
      { key: "filling", label: "Filling", sortOrder: 5 },
      { key: "comfort", label: "Comfort", sortOrder: 6 },
      { key: "colour", label: "Colour", sortOrder: 7 },
    ])
    .returning();
  const g = Object.fromEntries(groups.map((row) => [row.key, row]));

  const purposes = await addOptions(g.purpose.id, PURPOSES);
  const sizeGroups = await addOptions(g.size_group.id, SIZE_GROUPS);
  const thicknesses = await addOptions(g.thickness.id, THICKNESSES);
  const covers = await addOptions(g.cover_material.id, COVER_MATERIALS);
  const fillings = await addOptions(g.filling.id, FILLINGS);
  const comforts = await addOptions(g.comfort.id, COMFORTS);
  const colours = await addOptions(g.colour.id, COLOURS);

  // Beds / Sofas / Computer tables — Figma category config masters
  const furnitureSeed = categoryConfigSeedRows();
  const furnitureGroups = await db
    .insert(schema.optionGroups)
    .values(furnitureSeed.groups)
    .returning();
  const furnitureGroupByKey = Object.fromEntries(
    furnitureGroups.map((row) => [row.key, row]),
  );
  for (const [groupKey, rows] of Object.entries(
    furnitureSeed.opts.reduce<
      Record<string, { label: string; slug: string }[]>
    >((acc, o) => {
      (acc[o.groupKey] ??= []).push({ label: o.label, slug: o.slug });
      return acc;
    }, {}),
  )) {
    const group = furnitureGroupByKey[groupKey];
    if (group) await addOptions(group.id, rows);
  }

  const bySlug = (rows: { slug: string; id: string }[]) =>
    Object.fromEntries(rows.map((r) => [r.slug, r]));

  const purposeBy = bySlug(purposes);
  const sizeBy = bySlug(sizeGroups);
  const thickBy = bySlug(thicknesses);
  const coverBy = bySlug(covers);
  const fillingBy = bySlug(fillings);
  const comfortBy = bySlug(comforts);
  const colourBy = bySlug(colours);

  // Extra brand-specific mattress types / materials
  const extraPurposes = await addOptions(g.purpose.id, [
    { label: "Cooling", slug: "cooling" },
    { label: "Orthopaedic", slug: "orthopaedic" },
    { label: "Hybrid support", slug: "hybrid-support" },
  ]);
  const extraComforts = await addOptions(g.comfort.id, [
    { label: "Plush", slug: "plush" },
  ]);
  const extraFillings = await addOptions(g.filling.id, [
    { label: "Latex", slug: "latex" },
  ]);
  const extraCovers = await addOptions(g.cover_material.id, [
    { label: "Knitted fabric", slug: "knitted-fabric" },
  ]);
  Object.assign(purposeBy, bySlug(extraPurposes));
  Object.assign(comfortBy, bySlug(extraComforts));
  Object.assign(fillingBy, bySlug(extraFillings));
  Object.assign(coverBy, bySlug(extraCovers));

  type BrandOptPlan = {
    purposes: string[];
    comforts: string[];
    fillings: string[];
    covers: string[];
  };

  const brandOptionPlan: Record<string, BrandOptPlan> = {
    "wake-fit": {
      purposes: ["sleeping", "pain-relief", "cooling"],
      comforts: ["firm", "medium", "soft", "dual-comfort"],
      fillings: ["coir", "polyfoam", "latex"],
      covers: ["cotton", "polyester", "knitted-fabric"],
    },
    sleepwell: {
      purposes: ["sleeping", "pain-relief", "orthopaedic"],
      comforts: ["firm", "medium", "dual-comfort", "plush"],
      fillings: ["coir", "cotton", "polyfoam"],
      covers: ["cotton", "polyester-blend"],
    },
    "livpure-smart": {
      purposes: ["sleeping", "cooling", "hybrid-support"],
      comforts: ["soft", "medium"],
      fillings: ["polyfoam", "latex"],
      covers: ["polyester", "knitted-fabric"],
    },
    "centuary-mattresses": {
      purposes: ["sleeping", "pain-relief", "orthopaedic"],
      comforts: ["firm", "medium"],
      fillings: ["coir", "polyfoam"],
      covers: ["cotton", "polyester"],
    },
    sleepyhug: {
      purposes: ["sleeping", "cooling"],
      comforts: ["soft", "medium", "plush"],
      fillings: ["polyfoam", "cotton"],
      covers: ["polyester-blend", "knitted-fabric"],
    },
    "the-sleep-company": {
      purposes: ["sleeping", "pain-relief", "hybrid-support"],
      comforts: ["firm", "dual-comfort", "plush"],
      fillings: ["latex", "polyfoam"],
      covers: ["cotton", "knitted-fabric"],
    },
  };

  const brandLinks: { brandId: string; optionId: string }[] = [];
  for (const [brandSlug, plan] of Object.entries(brandOptionPlan)) {
    const brand = mattressBrandBySlug[brandSlug];
    if (!brand) continue;
    const pick = (
      map: Record<string, { id: string }>,
      slugs: string[],
    ) => {
      for (const os of slugs) {
        const opt = map[os];
        if (opt) brandLinks.push({ brandId: brand.id, optionId: opt.id });
      }
    };
    pick(purposeBy, plan.purposes);
    pick(comfortBy, plan.comforts);
    pick(fillingBy, plan.fillings);
    pick(coverBy, plan.covers);
    await db
      .update(schema.mattressBrands)
      .set({
        defaults: {
          warrantyYears: brandSlug === "the-sleep-company" ? "10" : "5",
          trialNights: brandSlug === "wake-fit" ? "100" : "30",
          removableCover: "yes",
          flippable: brandSlug.includes("sleep") ? "yes" : "no",
          idealFor:
            brandSlug === "wake-fit"
              ? "Side sleepers, couples"
              : "Everyday sleep",
        },
      })
      .where(eq(schema.mattressBrands.id, brand.id));
  }
  if (brandLinks.length) {
    await db.insert(schema.mattressBrandOptions).values(brandLinks);
  }

  const dimInserts: {
    sizeGroupOptionId: string;
    lengthIn: number;
    widthIn: number;
    label: string;
    sortOrder: number;
  }[] = [];

  for (const [slug, pairs] of Object.entries(SIZE_DIMENSIONS)) {
    const group = sizeBy[slug];
    pairs.forEach(([lengthIn, widthIn], i) => {
      dimInserts.push({
        sizeGroupOptionId: group.id,
        lengthIn,
        widthIn,
        label: `${lengthIn}x${widthIn} inch`,
        sortOrder: i + 1,
      });
    });
  }

  const dimensions = await db
    .insert(schema.sizeDimensions)
    .values(dimInserts)
    .returning();

  function findDim(sizeSlug: string, lengthIn: number, widthIn: number) {
    const groupId = sizeBy[sizeSlug].id;
    return dimensions.find(
      (d) =>
        d.sizeGroupOptionId === groupId &&
        d.lengthIn === lengthIn &&
        d.widthIn === widthIn,
    );
  }

  let variantCount = 0;

  // —— Mattresses (branded) ——
  for (const brand of MATTRESS_BRANDS) {
    const mattressBrandRow = mattressBrandBySlug[brand.slug];
    for (let m = 0; m < MATTRESS_MODELS.length; m++) {
      const model = MATTRESS_MODELS[m];
      const slug = productSlug(brand.slug, model.key);
      const name = `${brand.name} ${model.name}`;

      const [product] = await db
        .insert(schema.products)
        .values({
          categoryId: catBySlug.mattresses.id,
          mattressBrandId: mattressBrandRow.id,
          name,
          slug,
          description: `${name} — ${model.purpose === "pain-relief" ? "pain relief" : "everyday sleeping"} mattress.`,
          imageUrl: mattressImagePath(brand.slug, model.key),
          status: "published",
          isFeatured: m === 0,
          sortOrder: m + 1,
        })
        .returning();

      await syncProductOptions(product.id, [
        { optionGroupId: g.purpose.id, optionId: purposeBy[model.purpose].id },
        { optionGroupId: g.cover_material.id, optionId: coverBy[model.cover].id },
        { optionGroupId: g.filling.id, optionId: fillingBy[model.filling].id },
        { optionGroupId: g.comfort.id, optionId: comfortBy[model.comfort].id },
      ]);

      // HTML product-editor model: size (L×W) × thickness only — no colour.
      const batch: VariantInsert[] = [];
      for (const sizePlan of MATTRESS_SIZE_SKUS) {
        const dim = findDim(sizePlan.size, sizePlan.lengthIn, sizePlan.widthIn);
        if (!dim) continue;
        for (const thickKey of MATTRESS_THICKNESS_SKUS) {
          const priced = mattressPrice(sizePlan, thickKey);
          const skuParts = [
            brand.slug.slice(0, 6),
            model.key.slice(0, 8),
            sizePlan.size,
            `${sizePlan.lengthIn}x${sizePlan.widthIn}`,
            thickKey,
          ];
          batch.push({
            productId: product.id,
            sku: skuParts.join("-").slice(0, 80),
            sizeGroupOptionId: sizeBy[sizePlan.size].id,
            sizeDimensionId: dim.id,
            isCustomSize: false,
            thicknessOptionId: thickBy[thickKey].id,
            colourOptionId: null,
            mrp: String(priced.mrp),
            price: String(priced.price),
            stockQty: 6 + m,
            isActive: true,
          });
        }
      }
      await insertVariants(batch);
      variantCount += batch.length;
    }
  }

  // —— Cots (house-made, brand null) ——
  for (let m = 0; m < COT_MODELS.length; m++) {
    const model = COT_MODELS[m];
    const slug = houseProductSlug("cots", model.key);

    const [product] = await db
      .insert(schema.products)
      .values({
        categoryId: catBySlug.cots.id,
        mattressBrandId: null,
        name: model.name,
        slug,
        description: model.description,
        imageUrl: houseImagePath("cots", model.key),
        status: "published",
        isFeatured: m === 0,
        sortOrder: m + 1,
      })
      .returning();

    const cotBatch: VariantInsert[] = [];
    for (const plan of COT_VARIANT_PLANS) {
      const isCustom = plan.size === "custom";
      const dim =
        !isCustom && plan.lengthIn && plan.widthIn
          ? findDim(plan.size, plan.lengthIn, plan.widthIn)
          : null;

      for (const colour of COLOURS) {
        const skuParts = [
          "cot",
          model.key.slice(0, 12),
          plan.size,
          isCustom ? "custom" : `${plan.lengthIn}x${plan.widthIn}`,
          colour.slug,
        ];
        cotBatch.push({
          productId: product.id,
          sku: skuParts.join("-").slice(0, 80),
          sizeGroupOptionId: sizeBy[plan.size].id,
          sizeDimensionId: dim?.id ?? null,
          isCustomSize: isCustom,
          thicknessOptionId: null,
          colourOptionId: colourBy[colour.slug].id,
          mrp: String(plan.mrp),
          price: String(plan.price),
          stockQty: isCustom ? 0 : 4 + m,
          isActive: true,
        });
      }
    }
    await insertVariants(cotBatch);
    variantCount += cotBatch.length;
  }

  // —— Sofas (house-made; colour SKUs on custom size) ——
  for (let m = 0; m < SOFA_MODELS.length; m++) {
    const model = SOFA_MODELS[m];
    const slug = houseProductSlug("sofas", model.key);

    const [product] = await db
      .insert(schema.products)
      .values({
        categoryId: catBySlug.sofas.id,
        mattressBrandId: null,
        name: model.name,
        slug,
        description: model.description,
        imageUrl: houseImagePath("sofas", model.key),
        status: "published",
        isFeatured: m === 0,
        sortOrder: m + 1,
      })
      .returning();

    const sofaBatch: VariantInsert[] = COLOURS.map((colour, vi) => ({
      productId: product.id,
      sku: `sofa-${model.key.slice(0, 14)}-${colour.slug}`.slice(0, 80),
      sizeGroupOptionId: sizeBy.custom.id,
      sizeDimensionId: null,
      isCustomSize: true,
      thicknessOptionId: null,
      colourOptionId: colourBy[colour.slug].id,
      mrp: String(SOFA_VARIANT_PRICE.mrp + m * 500),
      price: String(SOFA_VARIANT_PRICE.price + m * 400),
      stockQty: 3 + vi,
      isActive: true,
    }));
    await insertVariants(sofaBatch);
    variantCount += sofaBatch.length;
  }

  // —— Computer tables (house-made; colour SKUs on custom size) ——
  for (let m = 0; m < TABLE_MODELS.length; m++) {
    const model = TABLE_MODELS[m];
    const slug = houseProductSlug("computer-tables", model.key);

    const [product] = await db
      .insert(schema.products)
      .values({
        categoryId: catBySlug["computer-tables"].id,
        mattressBrandId: null,
        name: model.name,
        slug,
        description: model.description,
        imageUrl: houseImagePath("computer-tables", model.key),
        status: "published",
        isFeatured: m === 0,
        sortOrder: m + 1,
      })
      .returning();

    const tableBatch: VariantInsert[] = COLOURS.map((colour, vi) => ({
      productId: product.id,
      sku: `table-${model.key.slice(0, 14)}-${colour.slug}`.slice(0, 80),
      sizeGroupOptionId: sizeBy.custom.id,
      sizeDimensionId: null,
      isCustomSize: true,
      thicknessOptionId: null,
      colourOptionId: colourBy[colour.slug].id,
      mrp: String(TABLE_VARIANT_PRICE.mrp + m * 300),
      price: String(TABLE_VARIANT_PRICE.price + m * 250),
      stockQty: 5 + vi,
      isActive: true,
    }));
    await insertVariants(tableBatch);
    variantCount += tableBatch.length;
  }

  const published = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.status, "published"));

  await seedOps(db);

  console.log("Done.");
  console.log(`  categories: ${cats.length}`);
  console.log(`  mattress brands: ${mattressBrandRows.length}`);
  console.log(`  size dimensions: ${dimensions.length}`);
  console.log(`  products: ${published.length}`);
  console.log(`  variants: ${variantCount}`);
  console.log("  ops: store, collections, gallery, reels, leads, orders, audit, segments");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
