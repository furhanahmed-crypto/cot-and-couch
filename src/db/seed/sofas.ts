import * as schema from "@/db/schema";
import { SOFA_PRODUCTS, type SofaProductSeed } from "./data/sofas";
import { db } from "./db";
import { lowestPriceOf, newId, rankByLowestPrice, toMoney, toSkuPart } from "./helpers";
import type { SeededAddon, SeededCategory, SeededVariant } from "./types";

/** One product per range row on the sheet; its quality is that range (add-ons are priced per quality). */
type SofaRange = SofaProductSeed & { productId: string; qualityId: string };
type SofaAddon = SeededAddon & { productId: string; kind: "addon" | "recliner"; sortOrder: number };

function buildVariants(range: SofaRange): SeededVariant[] {
  return range.variants.map((variant) => ({
    id: newId(),
    productId: range.productId,
    productName: range.name,
    sku: ["SOFA", range.slug, variant.sizeLabel].map(toSkuPart).join("-"),
    sizeLabel: variant.sizeLabel,
    seats: variant.seats,
    qualityId: range.qualityId,
    qualityName: range.name,
    colourName: null,
    mrp: null,
    price: variant.price,
  }));
}

function buildAddons(range: SofaRange): SofaAddon[] {
  return range.addons.map((addon, index) => ({
    id: newId(),
    productId: range.productId,
    name: addon.name,
    kind: addon.kind,
    priceUnit: addon.priceUnit,
    sortOrder: index + 1,
    prices: { [range.qualityId]: addon.price },
  }));
}

export async function seedSofas(categoryId: string): Promise<SeededCategory> {
  const ranges: SofaRange[] = SOFA_PRODUCTS.map((product) => ({ ...product, productId: newId(), qualityId: newId() }));
  const variants = ranges.flatMap(buildVariants);
  const addons = ranges.flatMap(buildAddons);

  const sortOrders = rankByLowestPrice(lowestPriceOf(ranges.map((range) => range.productId), variants));

  await db.batch([
    db.insert(schema.qualities).values(
      ranges.map((range, index) => ({ id: range.qualityId, categoryId, name: range.name, slug: range.slug, sortOrder: sortOrders[index] })),
    ),
    db.insert(schema.products).values(
      ranges.map((range, index) => ({
        id: range.productId, categoryId, name: range.name, slug: range.slug,
        status: "published" as const, sortOrder: sortOrders[index],
        isFeatured: sortOrders[index] === 1, // demo: the cheapest product of each category is featured
      })),
    ),
    db.insert(schema.productVariants).values(
      variants.map((variant, index) => ({
        id: variant.id, productId: variant.productId, sku: variant.sku, sizeLabel: variant.sizeLabel,
        seats: variant.seats, qualityId: variant.qualityId, price: toMoney(variant.price), sortOrder: index + 1,
      })),
    ),
    db.insert(schema.addons).values(
      addons.map((addon) => ({
        id: addon.id, categoryId, productId: addon.productId, name: addon.name,
        kind: addon.kind, priceUnit: addon.priceUnit, sortOrder: addon.sortOrder,
      })),
    ),
    db.insert(schema.addonPrices).values(
      addons.flatMap((addon) =>
        Object.entries(addon.prices).map(([qualityId, price]) => ({ addonId: addon.id, qualityId, price: toMoney(price) })),
      ),
    ),
  ]);

  return { productIds: ranges.map((range) => range.productId), variants, addons };
}
