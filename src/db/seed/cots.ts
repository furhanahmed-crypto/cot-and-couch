import * as schema from "@/db/schema";
import type { SeededColour } from "./catalogue";
import {
  COT_ADDONS,
  COT_LONG_LENGTH_IN,
  COT_QUALITIES,
  COT_SIZES,
  COT_STYLES,
  type CotQualitySeed,
  type CotSizePrice,
} from "./data/cots";
import { db } from "./db";
import { newId, toMoney, toMoneyOrNull, toSkuPart, toSlug } from "./helpers";
import type { SeededAddon, SeededCategory, SeededVariant } from "./types";

type CotQuality = CotQualitySeed & { id: string };
type CotProduct = { id: string; name: string; style: string };
type CotVariant = SeededVariant & { lengthIn: number | null; widthIn: number | null; colourId: string };
type LengthOption = { lengthIn: number | null; mrp: number | null; price: number };

/** One size price as 1 or 2 lengths: the base size, plus 78 in when the sheet gives an extra. */
function toLengthOptions(sizePrice: CotSizePrice): LengthOption[] {
  const base = COT_SIZES[sizePrice.size];
  const options: LengthOption[] = [{ lengthIn: base.lengthIn, mrp: sizePrice.mrp, price: sizePrice.price }];
  if (sizePrice.extraFor78 === undefined) return options;
  // The sheets give no MRP for 78 in, so none is stored.
  options.push({ lengthIn: COT_LONG_LENGTH_IN, mrp: null, price: sizePrice.price + sizePrice.extraFor78 });
  return options;
}

function buildVariants(product: CotProduct, qualities: CotQuality[], colours: SeededColour[]): CotVariant[] {
  const variants: CotVariant[] = [];
  for (const quality of qualities) {
    for (const sizePrice of quality.prices) {
      for (const option of toLengthOptions(sizePrice)) {
        for (const colour of colours) {
          const skuParts = ["COT", product.style, quality.slug, sizePrice.size, option.lengthIn ?? "", colour.name];
          variants.push({
            id: newId(),
            productId: product.id,
            productName: product.name,
            sku: skuParts.filter(Boolean).map(String).map(toSkuPart).join("-"),
            sizeLabel: sizePrice.size,
            lengthIn: option.lengthIn,
            widthIn: COT_SIZES[sizePrice.size].widthIn,
            seats: null,
            qualityId: quality.id,
            qualityName: quality.name,
            colourId: colour.id,
            colourName: colour.name,
            mrp: option.mrp,
            price: option.price,
          });
        }
      }
    }
  }
  return variants;
}

function toVariantRow(variant: CotVariant, sortOrder: number) {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    sizeLabel: variant.sizeLabel,
    lengthIn: variant.lengthIn,
    widthIn: variant.widthIn,
    qualityId: variant.qualityId,
    colourId: variant.colourId,
    mrp: toMoneyOrNull(variant.mrp),
    price: toMoney(variant.price),
    sortOrder,
  };
}

function buildAddons(qualities: CotQuality[]): SeededAddon[] {
  return COT_ADDONS.map((addon) => ({
    id: newId(),
    name: addon.name,
    priceUnit: "fixed",
    prices: Object.fromEntries(qualities.map((quality) => [quality.id, addon.prices[quality.priceList]])),
  }));
}

export async function seedCots(categoryId: string, colours: SeededColour[]): Promise<SeededCategory> {
  const qualities: CotQuality[] = COT_QUALITIES.map((quality) => ({ ...quality, id: newId() }));
  const products: CotProduct[] = COT_STYLES.map((style) => ({ id: newId(), name: `${style} Cot`, style }));
  const variants = products.flatMap((product) => buildVariants(product, qualities, colours));
  const addons = buildAddons(qualities);

  await db.batch([
    db.insert(schema.qualities).values(
      qualities.map((quality, index) => ({
        id: quality.id, categoryId, name: quality.name, slug: quality.slug,
        description: quality.description, warrantyYears: quality.warrantyYears, sortOrder: index + 1,
      })),
    ),
    db.insert(schema.products).values(
      products.map((product, index) => ({
        id: product.id, categoryId, name: product.name, slug: toSlug(product.name),
        status: "published" as const, sortOrder: index + 1,
        isFeatured: index === 0, // demo: the first product of each category is featured
      })),
    ),
    db.insert(schema.productVariants).values(variants.map((variant, index) => toVariantRow(variant, index + 1))),
    db.insert(schema.addons).values(
      COT_ADDONS.map((addon, index) => ({
        id: addons[index].id, categoryId, name: addon.name, sizeLabel: addon.sizeLabel, sortOrder: index + 1,
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
