import * as schema from "@/db/schema";
import type { SeededColour } from "./catalogue";
import { COT_ADDONS, COT_LONG_LENGTH_IN, COT_QUALITIES, COT_SIZES, type CotQualitySeed, type CotSizePrice } from "./data/cots";
import { db } from "./db";
import { lowestPriceOf, newId, rankByLowestPrice, toMoney, toMoneyOrNull, toSkuPart, toSlug } from "./helpers";
import type { SeededAddon, SeededCategory, SeededVariant } from "./types";

/** One product per range on the client sheets; its quality is that range. */
type CotRange = CotQualitySeed & { qualityId: string; productId: string; productName: string };
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

/** Every size, length and wood finish of one range. */
function buildVariants(range: CotRange, colours: SeededColour[]): CotVariant[] {
  return range.prices.flatMap((sizePrice) =>
    toLengthOptions(sizePrice).flatMap((option) =>
      colours.map((colour) => ({
        id: newId(),
        productId: range.productId,
        productName: range.productName,
        sku: ["COT", range.slug, sizePrice.size, option.lengthIn ?? "", colour.name].filter(Boolean).map(String).map(toSkuPart).join("-"),
        sizeLabel: sizePrice.size,
        lengthIn: option.lengthIn,
        widthIn: COT_SIZES[sizePrice.size].widthIn,
        seats: null,
        qualityId: range.qualityId,
        qualityName: range.name,
        colourId: colour.id,
        colourName: colour.name,
        mrp: option.mrp,
        price: option.price,
      })),
    ),
  );
}

function toVariantRow(variant: CotVariant, sortOrder: number) {
  return {
    id: variant.id, productId: variant.productId, sku: variant.sku, sizeLabel: variant.sizeLabel,
    lengthIn: variant.lengthIn, widthIn: variant.widthIn, qualityId: variant.qualityId, colourId: variant.colourId,
    mrp: toMoneyOrNull(variant.mrp), price: toMoney(variant.price), sortOrder,
  };
}

/** Category-wide add-ons, priced from the sheet each range is on. No price = not offered for that range. */
function buildAddons(ranges: CotRange[]): SeededAddon[] {
  return COT_ADDONS.map((addon) => ({
    id: newId(),
    name: addon.name,
    priceUnit: "fixed",
    prices: Object.fromEntries(
      ranges.flatMap((range) => {
        const price = addon.prices[range.priceList];
        const isOffered = price !== undefined && (!addon.qualitySlug || addon.qualitySlug === range.slug);
        return isOffered ? [[range.qualityId, price]] : [];
      }),
    ),
  }));
}

export async function seedCots(categoryId: string, colours: SeededColour[]): Promise<SeededCategory> {
  const ranges: CotRange[] = COT_QUALITIES.map((quality) => ({
    ...quality, qualityId: newId(), productId: newId(), productName: `${quality.name} Cot`,
  }));
  const variants = ranges.flatMap((range) => buildVariants(range, colours));
  const addons = buildAddons(ranges);

  const sortOrders = rankByLowestPrice(lowestPriceOf(ranges.map((range) => range.productId), variants));

  await db.batch([
    db.insert(schema.qualities).values(
      ranges.map((range, index) => ({
        id: range.qualityId, categoryId, name: range.name, slug: range.slug,
        description: range.description, warrantyYears: range.warrantyYears, sortOrder: sortOrders[index],
      })),
    ),
    db.insert(schema.products).values(
      ranges.map((range, index) => ({
        id: range.productId, categoryId, name: range.productName, slug: toSlug(range.productName),
        status: "published" as const, sortOrder: sortOrders[index],
        isFeatured: sortOrders[index] === 1, // demo: the cheapest product of each category is featured
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

  return { productIds: ranges.map((range) => range.productId), variants, addons };
}
