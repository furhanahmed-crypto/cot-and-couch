import * as schema from "@/db/schema";
import { SOFA_PRODUCTS, SOFA_QUALITIES, type SofaProductSeed, type SofaQualitySlug } from "./data/sofas";
import { db } from "./db";
import { newId, toMoney, toSkuPart } from "./helpers";
import type { SeededAddon, SeededCategory, SeededVariant } from "./types";

type QualityIds = Record<SofaQualitySlug, string>;
type SofaAddon = SeededAddon & { productId: string; kind: "addon" | "recliner"; sortOrder: number };

function buildVariants(product: SofaProductSeed, productId: string, qualityIds: QualityIds): SeededVariant[] {
  return product.variants.map((variant) => ({
    id: newId(),
    productId,
    productName: product.name,
    sku: ["SOFA", product.slug, variant.sizeLabel, variant.quality].map(toSkuPart).join("-"),
    sizeLabel: variant.sizeLabel,
    seats: variant.seats,
    qualityId: qualityIds[variant.quality],
    qualityName: SOFA_QUALITIES.find((quality) => quality.slug === variant.quality)?.name ?? null,
    colourName: null,
    mrp: null,
    price: variant.price,
  }));
}

function buildAddons(product: SofaProductSeed, productId: string, qualityIds: QualityIds): SofaAddon[] {
  return product.addons.map((addon, index) => ({
    id: newId(),
    productId,
    name: addon.name,
    kind: addon.kind,
    priceUnit: addon.priceUnit,
    sortOrder: index + 1,
    prices: Object.fromEntries(
      Object.entries(addon.prices).map(([slug, price]) => [qualityIds[slug as SofaQualitySlug], price]),
    ),
  }));
}

export async function seedSofas(categoryId: string): Promise<SeededCategory> {
  const qualityRows = SOFA_QUALITIES.map((quality, index) => ({
    id: newId(), categoryId, name: quality.name, slug: quality.slug, sortOrder: index + 1,
  }));
  const qualityIds = Object.fromEntries(qualityRows.map((row) => [row.slug, row.id])) as QualityIds;
  const products = SOFA_PRODUCTS.map((product) => ({ ...product, id: newId() }));
  const variants = products.flatMap((product) => buildVariants(product, product.id, qualityIds));
  const addons = products.flatMap((product) => buildAddons(product, product.id, qualityIds));

  await db.batch([
    db.insert(schema.qualities).values(qualityRows),
    db.insert(schema.products).values(
      products.map((product, index) => ({
        id: product.id, categoryId, name: product.name, slug: product.slug,
        status: "published" as const, sortOrder: index + 1,
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

  return { productIds: products.map((product) => product.id), variants, addons };
}
