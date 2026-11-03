/** Cots (DB slug `cots`) — range masters + shared width options. Shop label: Beds. */

import {
  BED_RANGE_PRICING,
  bedWidthSeedOptions,
} from "@/constants/bed-pricing";

export const BED_CATEGORY_SLUG = "cots";

export const BED_WIDTH_GROUP_KEY = "cot_width";

export const BED_RANGE_COUNT = 8;

/** Default bed range masters (sort_order 1–8). Prime = former cushion range. */
export const BED_RANGE_SEEDS = [
  { sortOrder: 1, name: "Ideal Range", slug: "ideal-range", cotType: "non_cushion" as const },
  { sortOrder: 2, name: "Optimum Range", slug: "optimum-range", cotType: "non_cushion" as const },
  { sortOrder: 3, name: "Essential Range", slug: "essential-range", cotType: "non_cushion" as const },
  { sortOrder: 4, name: "Prime Range", slug: "prime-range", cotType: "cushion" as const },
  { sortOrder: 5, name: "Premium Range", slug: "premium-range", cotType: "non_cushion" as const },
  { sortOrder: 6, name: "Royal Range", slug: "royal-range", cotType: "non_cushion" as const },
  { sortOrder: 7, name: "Range 7", slug: "range-7", cotType: "cushion" as const },
  { sortOrder: 8, name: "Range 8", slug: "range-8", cotType: "cushion" as const },
] as const;

/** @deprecated Use BED_RANGE_SEEDS */
export const BED_RANGE_NAMES: Record<number, string> = Object.fromEntries(
  BED_RANGE_SEEDS.map((r) => [r.sortOrder, r.name]),
);

/** Product name styles seeded under each range (3 products × 8 ranges). */
export const BED_PRODUCT_STYLES = ["Classic", "Storage", "Platform"] as const;

/** Width options: inches on label + 78" extra-length SKUs for Double/Queen/King. */
export const BED_WIDTH_OPTIONS = bedWidthSeedOptions().map((w) => ({
  label: w.label,
  detail: w.detail,
  slug: w.slug,
}));

/** Legacy slugs from earlier seeds — deactivate on migrate/reseed. */
export const OBSOLETE_BED_WIDTH_SLUGS = [
  "single",
  "double-diwan",
  "queen",
  "king",
] as const;

export const BED_VARIANT_ONLY_GROUP_KEYS = new Set<string>([BED_WIDTH_GROUP_KEY]);

export const OBSOLETE_BED_GROUP_KEYS = [
  "cot_storage_type",
  "cot_headboard",
  "cot_wood_type",
  "cot_polish_type",
  "cot_mattress_size",
  "cot_wood_grade",
] as const;

export function bedCotTypeForRangeSlug(
  slug: string,
): "non_cushion" | "cushion" {
  return BED_RANGE_PRICING[slug]?.cotType ?? "non_cushion";
}

/** @deprecated Prefer bedCotTypeForRangeSlug */
export function bedCotTypeForRange(sortOrder: number): "non_cushion" | "cushion" {
  const seed = BED_RANGE_SEEDS.find((r) => r.sortOrder === sortOrder);
  return seed?.cotType ?? "non_cushion";
}

/** Short label for product names: "Ideal Range" → "Ideal". */
export function bedRangeShortName(rangeName: string) {
  return rangeName.replace(/\s+Range$/i, "").trim() || rangeName;
}

/** Ranges that share the same styles and can switch quality on PDP. */
export const BED_QUALITY_SWITCH_RANGE_SLUGS = [
  "ideal-range",
  "optimum-range",
  "essential-range",
] as const;

export type BedQualitySwitchRangeSlug =
  (typeof BED_QUALITY_SWITCH_RANGE_SLUGS)[number];

export function isBedQualitySwitchRange(
  slug: string | null | undefined,
): slug is BedQualitySwitchRangeSlug {
  return (
    !!slug &&
    (BED_QUALITY_SWITCH_RANGE_SLUGS as readonly string[]).includes(slug)
  );
}

/** Style key from product slug, e.g. ideal-range-classic → classic */
export function bedStyleKeyFromProductSlug(
  productSlug: string,
  rangeSlug: string,
) {
  const prefix = `${rangeSlug}-`;
  if (!productSlug.startsWith(prefix)) return null;
  const style = productSlug.slice(prefix.length).trim();
  return style || null;
}

export function bedQualityLabel(rangeSlug: string) {
  const seed = BED_RANGE_SEEDS.find((r) => r.slug === rangeSlug);
  return seed ? bedRangeShortName(seed.name) : rangeSlug;
}

export function bedProductSlug(rangeSlug: string, style: string) {
  return `${rangeSlug}-${style.toLowerCase()}`;
}

export function bedProductName(rangeName: string, style: string) {
  return `${bedRangeShortName(rangeName)} ${style}`;
}
