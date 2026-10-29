/**
 * Phase 6: copy legacy public tables → coc_* (idempotent via coc_migration_id_map).
 * @see docs/ARCHITECTURE.md
 *
 * Usage: bun run db:migrate-legacy
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import { CATEGORY_CONFIGS } from "../constants/category-config";
import * as legacy from "./schema-legacy";
import { cocProfiles, cocCategories, cocStoreSettings } from "./schema-coc";
import {
  cocBrandOptionLinks,
  cocCategoryOptionGroups,
  cocCollections,
  cocMattressBrands,
  cocOptionGroups,
  cocOptions,
  cocProductCollections,
  cocProductOptionValues,
  cocProducts,
  cocProductVariants,
  cocSizeDimensions,
} from "./schema-coc-catalogue";
import {
  cocGalleryItems,
  cocOrderLines,
  cocOrders,
  cocOrderStatusHistory,
  cocReels,
} from "./schema-coc-commerce";
import { cocLeadEvents, cocLeads } from "./schema-coc-crm";
import { cocCartLines, cocProfileFavourites } from "./schema-coc-shop";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL_UNPOOLED or DATABASE_URL required");
  process.exit(1);
}

const sqlClient = neon(url);
const db = drizzle(sqlClient, { schema: legacy });

const MATTRESS_GROUP_KEYS = [
  "purpose",
  "cover_material",
  "filling",
  "comfort",
  "size_group",
  "thickness",
  "colour",
] as const;

async function ensureMapTable() {
  await sqlClient`
    CREATE TABLE IF NOT EXISTS coc_migration_id_map (
      entity text NOT NULL,
      old_id uuid NOT NULL,
      new_id uuid NOT NULL,
      PRIMARY KEY (entity, old_id)
    )
  `;
}

async function getMapped(entity: string, oldId: string) {
  const rows = await sqlClient`
    SELECT new_id FROM coc_migration_id_map
    WHERE entity = ${entity} AND old_id = ${oldId}::uuid
  `;
  return rows[0]?.new_id as string | undefined;
}

async function remember(entity: string, oldId: string, newId: string) {
  await sqlClient`
    INSERT INTO coc_migration_id_map (entity, old_id, new_id)
    VALUES (${entity}, ${oldId}::uuid, ${newId}::uuid)
    ON CONFLICT (entity, old_id) DO NOTHING
  `;
}

async function migrateStoreSettings() {
  const existing = await db.select().from(cocStoreSettings).limit(1);
  if (existing.length) return;
  const [row] = await db.select().from(legacy.storeSettings).limit(1);
  if (!row) return;
  await db.insert(cocStoreSettings).values({
    name: row.name,
    address: row.address,
    mapUrl: row.mapUrl,
    timings: row.timings,
    phone: row.phone,
    whatsapp: row.whatsapp,
    privacyNotice: row.privacyNotice,
    updatedAt: row.updatedAt,
  });
}

async function migrateCategories() {
  const rows = await db.select().from(legacy.categories);
  for (const row of rows) {
    if (await getMapped("category", row.id)) continue;
    const [ins] = await db
      .insert(cocCategories)
      .values({
        name: row.name,
        slug: row.slug,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        createdAt: row.createdAt,
      })
      .returning({ id: cocCategories.id });
    await remember("category", row.id, ins.id);
  }
}

async function migrateOptionGroups() {
  const rows = await db.select().from(legacy.optionGroups);
  for (const row of rows) {
    if (await getMapped("option_group", row.id)) continue;
    const [ins] = await db
      .insert(cocOptionGroups)
      .values({
        key: row.key,
        label: row.label,
        sortOrder: row.sortOrder,
      })
      .returning({ id: cocOptionGroups.id });
    await remember("option_group", row.id, ins.id);
  }
}

async function migrateOptions() {
  const rows = await db.select().from(legacy.options);
  for (const row of rows) {
    if (await getMapped("option", row.id)) continue;
    const groupId = await getMapped("option_group", row.groupId);
    if (!groupId) continue;
    const [ins] = await db
      .insert(cocOptions)
      .values({
        groupId,
        label: row.label,
        slug: row.slug,
        hex: row.hex,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      })
      .returning({ id: cocOptions.id });
    await remember("option", row.id, ins.id);
  }
}

async function linkCategoryOptionGroups() {
  const cats = await db.select().from(cocCategories);
  const groups = await db.select().from(cocOptionGroups);
  const bySlug = new Map(cats.map((c) => [c.slug, c.id]));
  const byKey = new Map(groups.map((g) => [g.key, g.id]));

  const links: { categoryId: string; optionGroupId: string; sortOrder: number }[] =
    [];

  const mattressCat = bySlug.get("mattresses");
  if (mattressCat) {
    MATTRESS_GROUP_KEYS.forEach((key, i) => {
      const gid = byKey.get(key);
      if (gid) links.push({ categoryId: mattressCat, optionGroupId: gid, sortOrder: i });
    });
  }

  for (const cfg of CATEGORY_CONFIGS) {
    const catId = bySlug.get(cfg.slug);
    if (!catId) continue;
    cfg.groups.forEach((g, i) => {
      const gid = byKey.get(g.key);
      if (gid) links.push({ categoryId: catId, optionGroupId: gid, sortOrder: 100 + i });
    });
  }

  for (const link of links) {
    await db
      .insert(cocCategoryOptionGroups)
      .values({
        categoryId: link.categoryId,
        optionGroupId: link.optionGroupId,
        required: false,
        sortOrder: link.sortOrder,
      })
      .onConflictDoNothing();
  }
}

async function migrateMattressBrands() {
  const rows = await db.select().from(legacy.mattressBrands);
  for (const row of rows) {
    if (await getMapped("mattress_brand", row.id)) continue;
    const [ins] = await db
      .insert(cocMattressBrands)
      .values({
        name: row.name,
        slug: row.slug,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        defaults: row.defaults,
        createdAt: row.createdAt,
      })
      .returning({ id: cocMattressBrands.id });
    await remember("mattress_brand", row.id, ins.id);
  }
}

async function migrateBrandOptionLinks() {
  const rows = await db.select().from(legacy.mattressBrandOptions);
  for (const row of rows) {
    const brandId = await getMapped("mattress_brand", row.brandId);
    const optionId = await getMapped("option", row.optionId);
    if (!brandId || !optionId) continue;
    await db
      .insert(cocBrandOptionLinks)
      .values({ brandId, optionId })
      .onConflictDoNothing();
  }
}

async function migrateSizeDimensions() {
  const rows = await db.select().from(legacy.sizeDimensions);
  for (const row of rows) {
    if (await getMapped("size_dimension", row.id)) continue;
    const sizeGroupOptionId = await getMapped("option", row.sizeGroupOptionId);
    if (!sizeGroupOptionId) continue;
    const [ins] = await db
      .insert(cocSizeDimensions)
      .values({
        sizeGroupOptionId,
        lengthIn: row.lengthIn,
        widthIn: row.widthIn,
        label: row.label,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      })
      .returning({ id: cocSizeDimensions.id });
    await remember("size_dimension", row.id, ins.id);
  }
}

async function migrateCollections() {
  const rows = await db.select().from(legacy.collections);
  for (const row of rows) {
    if (await getMapped("collection", row.id)) continue;
    const [ins] = await db
      .insert(cocCollections)
      .values({
        name: row.name,
        slug: row.slug,
        description: row.description,
        featured: row.featured,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
      })
      .returning({ id: cocCollections.id });
    await remember("collection", row.id, ins.id);
  }
}

async function optionGroupIdByKey(key: string) {
  const [g] = await db
    .select({ id: cocOptionGroups.id })
    .from(cocOptionGroups)
    .where(eq(cocOptionGroups.key, key))
    .limit(1);
  return g?.id;
}

async function migrateProducts() {
  const rows = await db.select().from(legacy.products);
  for (const row of rows) {
    if (await getMapped("product", row.id)) continue;
    const categoryId = await getMapped("category", row.categoryId);
    if (!categoryId) continue;
    const mattressBrandId = row.mattressBrandId
      ? await getMapped("mattress_brand", row.mattressBrandId)
      : null;

    const [ins] = await db
      .insert(cocProducts)
      .values({
        categoryId,
        mattressBrandId: mattressBrandId ?? undefined,
        name: row.name,
        slug: row.slug,
        description: row.description,
        imageUrl: row.imageUrl,
        status: row.status,
        isFeatured: row.isFeatured,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
      .returning({ id: cocProducts.id });
    await remember("product", row.id, ins.id);

    const pairs: { groupKey: string; optionId: string | null }[] = [
      { groupKey: "purpose", optionId: row.purposeOptionId },
      { groupKey: "cover_material", optionId: row.coverMaterialOptionId },
      { groupKey: "filling", optionId: row.fillingOptionId },
      { groupKey: "comfort", optionId: row.comfortOptionId },
    ];
    for (const p of pairs) {
      if (!p.optionId) continue;
      const optionId = await getMapped("option", p.optionId);
      const optionGroupId = await optionGroupIdByKey(p.groupKey);
      if (!optionId || !optionGroupId) continue;
      await db
        .insert(cocProductOptionValues)
        .values({ productId: ins.id, optionGroupId, optionId })
        .onConflictDoNothing();
    }

    const attrs = row.attributes ?? {};
    for (const [key, textValue] of Object.entries(attrs)) {
      if (!textValue?.trim()) continue;
      const optionGroupId = await optionGroupIdByKey(key);
      if (!optionGroupId) continue;
      await db
        .insert(cocProductOptionValues)
        .values({ productId: ins.id, optionGroupId, textValue: textValue.trim() })
        .onConflictDoNothing();
    }
  }
}

async function migrateProductVariants() {
  const rows = await db.select().from(legacy.productVariants);
  for (const row of rows) {
    if (await getMapped("product_variant", row.id)) continue;
    const productId = await getMapped("product", row.productId);
    if (!productId) continue;

    const mapOpt = (id: string | null) =>
      id ? getMapped("option", id) : Promise.resolve(undefined);

    const [ins] = await db
      .insert(cocProductVariants)
      .values({
        productId,
        sku: row.sku,
        sizeGroupOptionId: (await mapOpt(row.sizeGroupOptionId)) ?? undefined,
        sizeDimensionId: row.sizeDimensionId
          ? ((await getMapped("size_dimension", row.sizeDimensionId)) ?? undefined)
          : undefined,
        isCustomSize: row.isCustomSize,
        thicknessOptionId: (await mapOpt(row.thicknessOptionId)) ?? undefined,
        colourOptionId: (await mapOpt(row.colourOptionId)) ?? undefined,
        mrp: row.mrp,
        price: row.price,
        stockQty: row.stockQty,
        isActive: row.isActive,
        createdAt: row.createdAt,
      })
      .returning({ id: cocProductVariants.id });
    await remember("product_variant", row.id, ins.id);
  }
}

async function migrateProductCollections() {
  const rows = await db.select().from(legacy.productCollections);
  for (const row of rows) {
    const productId = await getMapped("product", row.productId);
    const collectionId = await getMapped("collection", row.collectionId);
    if (!productId || !collectionId) continue;
    await db
      .insert(cocProductCollections)
      .values({ productId, collectionId })
      .onConflictDoNothing();
  }
}

async function migrateProfiles() {
  const rows = await db.select().from(legacy.profiles);
  for (const row of rows) {
    if (await getMapped("profile", row.id)) continue;
    const [ins] = await db
      .insert(cocProfiles)
      .values({
        authUserId: row.authUserId,
        name: row.name,
        email: row.email,
        role: row.role,
        phone: row.phone,
        address: row.area ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
      .returning({ id: cocProfiles.id });
    await remember("profile", row.id, ins.id);
  }
}

async function migrateLeadsAndEvents() {
  const rows = await db.select().from(legacy.leads);
  for (const row of rows) {
    let leadId = await getMapped("lead", row.id);
    if (!leadId) {
      const profileId = row.profileId
        ? await getMapped("profile", row.profileId)
        : null;
      const assignedToProfileId = row.assignedToProfileId
        ? await getMapped("profile", row.assignedToProfileId)
        : null;
      const [ins] = await db
        .insert(cocLeads)
        .values({
          profileId: profileId ?? undefined,
          name: row.name,
          mobile: row.mobile,
          area: row.area,
          intent: row.intent,
          assignedToProfileId: assignedToProfileId ?? undefined,
          whatsappOffers: row.whatsappOffers,
          followUpDone: row.followUpDone,
          firstSeenAt: row.firstSeenAt,
          lastSeenAt: row.lastSeenAt,
          createdAt: row.createdAt,
          updatedAt: row.lastSeenAt,
        })
        .returning({ id: cocLeads.id });
      leadId = ins.id;
      await remember("lead", row.id, leadId);
    }

    const existingEvents = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(cocLeadEvents)
      .where(eq(cocLeadEvents.leadId, leadId));
    if ((existingEvents[0]?.c ?? 0) > 0) continue;

    for (const productId of row.viewedProductIds ?? []) {
      const pid = await getMapped("product", productId);
      await db.insert(cocLeadEvents).values({
        leadId,
        eventType: "view",
        productId: pid ?? undefined,
        occurredAt: row.lastSeenAt,
      });
    }
    for (const productId of row.shortlistedIds ?? []) {
      const pid = await getMapped("product", productId);
      await db.insert(cocLeadEvents).values({
        leadId,
        eventType: "shortlist",
        productId: pid ?? undefined,
        occurredAt: row.lastSeenAt,
      });
    }
    for (const tap of row.ctaTaps ?? []) {
      const pid = tap.productId
        ? await getMapped("product", tap.productId)
        : undefined;
      await db.insert(cocLeadEvents).values({
        leadId,
        eventType: "cta",
        productId: pid ?? undefined,
        payload: { type: tap.type },
        occurredAt: tap.at ? new Date(tap.at) : row.lastSeenAt,
      });
    }
  }
}

async function migrateOrders() {
  const rows = await db.select().from(legacy.orders);
  for (const row of rows) {
    if (await getMapped("order", row.id)) continue;

    const productId = row.productId
      ? await getMapped("product", row.productId)
      : null;
    const variantId = row.variantId
      ? await getMapped("product_variant", row.variantId)
      : null;
    const lineTotal = row.agreedPrice;
    const qty = row.quantity;

    const [order] = await db
      .insert(cocOrders)
      .values({
        customerName: row.customerName,
        customerMobile: row.customerMobile,
        address: row.address,
        subtotal: lineTotal,
        advancePaid: row.advancePaid,
        expectedDelivery: row.expectedDelivery,
        status: row.status,
        deliveryPhotoUrl: row.deliveryPhotoUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
      .returning({ id: cocOrders.id });
    await remember("order", row.id, order.id);

    await db.insert(cocOrderLines).values({
      orderId: order.id,
      productId: productId ?? undefined,
      variantId: variantId ?? undefined,
      quantity: qty,
      unitPrice: lineTotal,
      lineTotal,
      sortOrder: 0,
    });
  }
}

async function migrateOrderHistory() {
  const rows = await db.select().from(legacy.orderStatusHistory);
  for (const row of rows) {
    const orderId = await getMapped("order", row.orderId);
    if (!orderId) continue;
    await db.insert(cocOrderStatusHistory).values({
      orderId,
      status: row.status,
      note: row.note,
      byName: row.byName,
      at: row.at,
    });
  }
}

async function migrateGalleryAndReels() {
  for (const row of await db.select().from(legacy.galleryItems)) {
    if (await getMapped("gallery_item", row.id)) continue;
    const productId = row.productId
      ? await getMapped("product", row.productId)
      : null;
    const [ins] = await db
      .insert(cocGalleryItems)
      .values({
        imageUrl: row.imageUrl,
        productId: productId ?? undefined,
        area: row.area,
        deliveryMonth: row.deliveryMonth,
        approved: row.approved,
        sortOrder: row.sortOrder,
        createdAt: row.createdAt,
      })
      .returning({ id: cocGalleryItems.id });
    await remember("gallery_item", row.id, ins.id);
  }

  for (const row of await db.select().from(legacy.reels)) {
    if (await getMapped("reel", row.id)) continue;
    const [ins] = await db
      .insert(cocReels)
      .values({
        title: row.title,
        coverUrl: row.coverUrl,
        videoUrl: row.videoUrl,
        instagramUrl: row.instagramUrl,
        tags: row.tags,
        sortOrder: row.sortOrder,
        isActive: row.isActive,
        createdAt: row.createdAt,
      })
      .returning({ id: cocReels.id });
    await remember("reel", row.id, ins.id);
  }
}

async function migrateCartsAndFavourites() {
  for (const row of await db.select().from(legacy.profileFavourites)) {
    const profileId = await getMapped("profile", row.profileId);
    const productId = await getMapped("product", row.productId);
    if (!profileId || !productId) continue;
    await db
      .insert(cocProfileFavourites)
      .values({
        profileId,
        productId,
        createdAt: row.createdAt,
      })
      .onConflictDoNothing();
  }

  for (const row of await db.select().from(legacy.carts)) {
    if (await getMapped("cart", row.id)) continue;
    const profileId = await getMapped("profile", row.profileId);
    const productId = await getMapped("product", row.productId);
    const variantId = await getMapped("product_variant", row.variantId);
    if (!profileId || !productId || !variantId) continue;
    const [ins] = await db
      .insert(cocCartLines)
      .values({
        profileId,
        productId,
        variantId,
        quantity: row.quantity,
        customLengthIn: row.customLengthIn,
        customWidthIn: row.customWidthIn,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
      .returning({ id: cocCartLines.id });
    await remember("cart", row.id, ins.id);
  }
}

async function seedCotRanges() {
  const [cat] = await db
    .select()
    .from(cocCategories)
    .where(eq(cocCategories.slug, "cots"))
    .limit(1);
  if (!cat) return;

  const existing = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(cocProducts)
    .where(eq(cocProducts.categoryId, cat.id));
  if ((existing[0]?.c ?? 0) > 0) return;

  let widthGroupId = await optionGroupIdByKey("cot_width");
  if (!widthGroupId) {
    const [g] = await db
      .insert(cocOptionGroups)
      .values({ key: "cot_width", label: "Bed width", sortOrder: 5 })
      .returning({ id: cocOptionGroups.id });
    widthGroupId = g.id;
    const widths = [
      { label: "Single", slug: "single" },
      { label: "Double", slug: "double" },
      { label: "Queen", slug: "queen" },
      { label: "King", slug: "king" },
    ];
    for (let i = 0; i < widths.length; i++) {
      await db.insert(cocOptions).values({
        groupId: widthGroupId,
        label: widths[i].label,
        slug: widths[i].slug,
        sortOrder: i + 1,
      });
    }
    await db
      .insert(cocCategoryOptionGroups)
      .values({
        categoryId: cat.id,
        optionGroupId: widthGroupId,
        required: true,
        sortOrder: 0,
      })
      .onConflictDoNothing();
  }

  const widthOptions = await db
    .select()
    .from(cocOptions)
    .where(eq(cocOptions.groupId, widthGroupId));

  for (let range = 1; range <= 8; range++) {
    const cotType = range <= 6 ? "non_cushion" : "cushion";
    const [product] = await db
      .insert(cocProducts)
      .values({
        categoryId: cat.id,
        name: `Range ${range}`,
        slug: `cot-range-${range}`,
        rangeNumber: range,
        cotType,
        status: "published",
        sortOrder: range,
      })
      .returning({ id: cocProducts.id });

    for (const w of widthOptions) {
      await db.insert(cocProductVariants).values({
        productId: product.id,
        sku: `COT-R${range}-${w.slug.toUpperCase()}`,
        widthOptionId: w.id,
        mrp: "0",
        price: "0",
        stockQty: 0,
        isActive: true,
      });
    }
  }
  console.log("Seeded 8 cot ranges × 4 widths (prices 0 — set in admin).");
}

async function printCounts() {
  const tables = [
    "coc_categories",
    "coc_products",
    "coc_product_variants",
    "coc_leads",
    "coc_lead_events",
    "coc_orders",
    "coc_order_lines",
  ] as const;
  for (const t of tables) {
    const r = await sqlClient.query(`SELECT count(*)::int AS c FROM "${t}"`);
    console.log(`  ${t}: ${r[0]?.c ?? 0}`);
  }
}

async function main() {
  console.log("Phase 6: legacy → coc_* …");
  await ensureMapTable();
  await migrateStoreSettings();
  await migrateCategories();
  await migrateOptionGroups();
  await migrateOptions();
  await linkCategoryOptionGroups();
  await migrateMattressBrands();
  await migrateBrandOptionLinks();
  await migrateSizeDimensions();
  await migrateCollections();
  await migrateProducts();
  await migrateProductVariants();
  await migrateProductCollections();
  await migrateProfiles();
  await migrateLeadsAndEvents();
  await migrateOrders();
  await migrateOrderHistory();
  await migrateGalleryAndReels();
  await migrateCartsAndFavourites();
  await seedCotRanges();
  console.log("Counts:");
  await printCounts();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
