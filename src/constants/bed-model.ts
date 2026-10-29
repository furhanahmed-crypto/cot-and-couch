/** Beds (DB slug `cots`) — 8 range products, shared width masters. */

export const BED_CATEGORY_SLUG = "cots";

export const BED_WIDTH_GROUP_KEY = "cot_width";

export const BED_RANGE_COUNT = 8;

/** Default product names by range_number (7–8 stay generic). */
export const BED_RANGE_NAMES: Record<number, string> = {
  1: "Ideal Range",
  2: "Optimum Range",
  3: "Essential Range",
  4: "Prime Range",
  5: "Premium Range",
  6: "Royal Range",
  7: "Range 7",
  8: "Range 8",
};

/** Seed / migration defaults for cot_width options. */
export const BED_WIDTH_OPTIONS = [
  { label: "Single", detail: "3 ft × 6 ft", slug: "single" },
  {
    label: "Double / Diwan Bed Width",
    detail: "4 ft × 6 ft",
    slug: "double-diwan",
  },
  { label: "Queen Size", detail: "5 ft × 6 ft", slug: "queen" },
  { label: "King Size", detail: "6 ft × 6 ft", slug: "king" },
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

export function bedCotTypeForRange(range: number): "non_cushion" | "cushion" {
  return range <= 6 ? "non_cushion" : "cushion";
}

export function bedRangeSlug(range: number) {
  return `cot-range-${range}`;
}
