/**
 * Cot / bed price lists from showroom sheets.
 * Cushion Range / Cushion Back Range → Prime Range (never call it cushion back in UI).
 */

export type BedSizeKey = "single" | "jodi" | "double" | "queen" | "king";

export type BedAddonKey =
  | "storage_king"
  | "storage_queen"
  | "hydraulics"
  | "mobile_top"
  | "headbox_storage"
  | "cushion_head"
  | "cushion_foot"
  | "full_cushion_king"
  | "full_cushion_queen";

export type BedAddonTier = "affordable" | "standard";

/** Base size keys (75" length). Extra length uses double/queen/king + surcharge. */
export const BED_SIZE_DEFS: Record<
  BedSizeKey,
  { label: string; detail: string; slug: string; lengthIn: number; widthIn: number }
> = {
  single: {
    label: "Single 75×36 inches",
    detail: "75 × 36 inches",
    slug: "single-75x36",
    lengthIn: 75,
    widthIn: 36,
  },
  jodi: {
    label: "Singles-Jodi 75×36 inches (2 pcs)",
    detail: "75 × 36 inches × 2 pcs",
    slug: "singles-jodi-75x36",
    lengthIn: 75,
    widthIn: 36,
  },
  double: {
    label: "Double 75×48 inches",
    detail: "75 × 48 inches",
    slug: "double-75x48",
    lengthIn: 75,
    widthIn: 48,
  },
  queen: {
    label: "Queen 75×60 inches",
    detail: "75 × 60 inches",
    slug: "queen-75x60",
    lengthIn: 75,
    widthIn: 60,
  },
  king: {
    label: "King 75×72 inches",
    detail: "75 × 72 inches",
    slug: "king-75x72",
    lengthIn: 75,
    widthIn: 72,
  },
};

/** Width options shown in admin + variants (75" + 78" extra-length SKUs). */
export function bedWidthSeedOptions() {
  const base = (Object.keys(BED_SIZE_DEFS) as BedSizeKey[]).map((key) => {
    const d = BED_SIZE_DEFS[key];
    return {
      sizeKey: key as BedSizeKey,
      label: d.label,
      detail: d.detail,
      slug: d.slug,
      isExtraLength: false as boolean,
    };
  });
  const title = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);
  const extra: {
    sizeKey: BedSizeKey;
    label: string;
    detail: string;
    slug: string;
    isExtraLength: boolean;
  }[] = (["double", "queen", "king"] as const).map((key) => {
    const d = BED_SIZE_DEFS[key];
    return {
      sizeKey: key,
      label: `${title(key)} 78×${d.widthIn} inches`,
      detail: `78 × ${d.widthIn} inches · extra length`,
      slug: `${key}-78x${d.widthIn}`,
      isExtraLength: true,
    };
  });
  return [...base, ...extra];
}

type RangePriceRow = {
  /** List / strikethrough MRP */
  mrp: Partial<Record<BedSizeKey, number>>;
  /** Discounted selling price (75" length) */
  price: Partial<Record<BedSizeKey, number>>;
  /** Extra for 78" length by size */
  extraLength: Partial<Record<"double" | "queen" | "king", number>>;
  warrantyYears: number;
  features: string;
  addonTier: BedAddonTier;
  cotType: "non_cushion" | "cushion";
};

/**
 * Per-range pricing from Affordable + All Categories sheets.
 * Prime = former Cushion / Cushion Back Range.
 */
export const BED_RANGE_PRICING: Record<string, RangePriceRow> = {
  "ideal-range": {
    mrp: { king: 22800, queen: 20800, double: 18800, jodi: 23800, single: 14800 },
    price: { king: 18800, queen: 16800, double: 14800, jodi: 19800, single: 11800 },
    extraLength: { king: 1000, queen: 900, double: 600 },
    warrantyYears: 2,
    features: "Solid wood body · 15mm solid wood sheets & teak support",
    addonTier: "affordable",
    cotType: "non_cushion",
  },
  "optimum-range": {
    mrp: { king: 23800, queen: 21800, double: 20800, jodi: 24800, single: 15800 },
    price: { king: 19800, queen: 17800, double: 16800, jodi: 20800, single: 12800 },
    extraLength: { king: 1200, queen: 1000, double: 900 },
    warrantyYears: 3,
    features: "Solid wood body · 15mm sheets + teak supports + side teak",
    addonTier: "affordable",
    cotType: "non_cushion",
  },
  "essential-range": {
    mrp: { king: 29800, queen: 27800, double: 23800, jodi: 30800, single: 15800 },
    price: { king: 23800, queen: 21800, double: 17800, jodi: 24800, single: 12800 },
    extraLength: { king: 1200, queen: 900, double: 600 },
    warrantyYears: 3,
    features: "Solid wood & fibre board body · 15mm sheets & teak support",
    addonTier: "standard",
    cotType: "non_cushion",
  },
  /** Former Cushion / Cushion Back Range — always labelled Prime Range */
  "prime-range": {
    mrp: { king: 29800, queen: 27800, double: 25800, jodi: 30800, single: 16800 },
    price: { king: 25800, queen: 23800, double: 21800, jodi: 26800, single: 13800 },
    extraLength: { king: 1200, queen: 1000, double: 900 },
    warrantyYears: 4,
    features: "Solid wood body & teak legs · 15mm sheets & bottom teak supports",
    addonTier: "affordable",
    cotType: "cushion",
  },
  "premium-range": {
    mrp: { king: 39800, queen: 37800, double: 33800, jodi: 40800, single: 21800 },
    price: { king: 33800, queen: 31800, double: 27800, jodi: 34800, single: 17800 },
    extraLength: { king: 1500, queen: 1000, double: 900 },
    warrantyYears: 5,
    features: "Teakwood body · heavy centre · 18mm Gurjan hardwood & teak support",
    addonTier: "standard",
    cotType: "non_cushion",
  },
  "royal-range": {
    mrp: { king: 46800, queen: 43800, double: 39800, jodi: 47800, single: 24800 },
    price: { king: 39800, queen: 37800, double: 33800, jodi: 41800, single: 20800 },
    extraLength: { king: 1900, queen: 1600, double: 1300 },
    warrantyYears: 8,
    features: "Total teakwood · 18mm Gurjan hardwood & teak support",
    addonTier: "standard",
    cotType: "non_cushion",
  },
  /** Not on printed sheets — mirror Premium / Royal until priced */
  "range-7": {
    mrp: { king: 39800, queen: 37800, double: 33800, jodi: 40800, single: 21800 },
    price: { king: 33800, queen: 31800, double: 27800, jodi: 34800, single: 17800 },
    extraLength: { king: 1500, queen: 1000, double: 900 },
    warrantyYears: 5,
    features: "Range 7 · cushion construction",
    addonTier: "standard",
    cotType: "cushion",
  },
  "range-8": {
    mrp: { king: 46800, queen: 43800, double: 39800, jodi: 47800, single: 24800 },
    price: { king: 39800, queen: 37800, double: 33800, jodi: 41800, single: 20800 },
    extraLength: { king: 1900, queen: 1600, double: 1300 },
    warrantyYears: 8,
    features: "Range 8 · cushion construction",
    addonTier: "standard",
    cotType: "cushion",
  },
};

export const BED_ADDON_DEFS: {
  key: BedAddonKey;
  label: string;
  sortOrder: number;
  /** Only for non-cushion body ranges (Ideal / Optimum / Essential / Premium / Royal) */
  nonCushionOnly?: boolean;
  /** Limit visibility to these size keys when a size is selected */
  sizeKeys?: BedSizeKey[];
}[] = [
  { key: "storage_king", label: "Storage box (King)", sortOrder: 1, sizeKeys: ["king"] },
  { key: "storage_queen", label: "Storage box (Queen)", sortOrder: 2, sizeKeys: ["queen"] },
  { key: "hydraulics", label: "Hydraulics", sortOrder: 3 },
  { key: "mobile_top", label: "Mobile top", sortOrder: 4 },
  { key: "headbox_storage", label: "Headbox with storage boxes", sortOrder: 5 },
  {
    key: "cushion_head",
    label: "Cushion head",
    sortOrder: 6,
    nonCushionOnly: true,
  },
  {
    key: "cushion_foot",
    label: "Cushion foot",
    sortOrder: 7,
    nonCushionOnly: true,
  },
  {
    key: "full_cushion_king",
    label: "Full body cushion (King)",
    sortOrder: 8,
    sizeKeys: ["king"],
    nonCushionOnly: true,
  },
  {
    key: "full_cushion_queen",
    label: "Full body cushion (Queen)",
    sortOrder: 9,
    sizeKeys: ["queen"],
    nonCushionOnly: true,
  },
];

/** Addon rupee prices by tier (Affordable sheet vs All Categories sheet). */
export const BED_ADDON_PRICES: Record<BedAddonTier, Record<BedAddonKey, number>> = {
  affordable: {
    storage_king: 5800,
    storage_queen: 4800,
    hydraulics: 5500,
    mobile_top: 3500,
    headbox_storage: 4500,
    cushion_head: 3800,
    cushion_foot: 2800,
    full_cushion_king: 6800,
    full_cushion_queen: 4800,
  },
  standard: {
    storage_king: 7800,
    storage_queen: 6800,
    hydraulics: 7500,
    mobile_top: 4500,
    headbox_storage: 6500,
    cushion_head: 6800,
    cushion_foot: 4800,
    full_cushion_king: 6800,
    full_cushion_queen: 4800,
  },
};

export function bedSizeKeyFromSlug(slug: string): BedSizeKey | null {
  if (slug.startsWith("single-75") && !slug.includes("jodi")) return "single";
  if (slug.includes("jodi")) return "jodi";
  if (slug.startsWith("double")) return "double";
  if (slug.startsWith("queen")) return "queen";
  if (slug.startsWith("king")) return "king";
  return null;
}

export function bedVariantPrices(
  rangeSlug: string,
  sizeKey: BedSizeKey,
  isExtraLength: boolean,
): { mrp: number; price: number } | null {
  const row = BED_RANGE_PRICING[rangeSlug];
  if (!row) return null;
  const basePrice = row.price[sizeKey];
  const baseMrp = row.mrp[sizeKey];
  if (basePrice == null || baseMrp == null) return null;
  if (!isExtraLength) return { mrp: baseMrp, price: basePrice };
  if (sizeKey === "single" || sizeKey === "jodi") return null;
  const surcharge = row.extraLength[sizeKey] ?? 0;
  return { mrp: baseMrp + surcharge, price: basePrice + surcharge };
}

export function bedAddonPrice(tier: BedAddonTier, key: BedAddonKey) {
  return BED_ADDON_PRICES[tier][key];
}

export function bedRangeAddonTier(rangeSlug: string): BedAddonTier {
  return BED_RANGE_PRICING[rangeSlug]?.addonTier ?? "standard";
}

export type ShopBedAddon = {
  id: string;
  key: BedAddonKey;
  label: string;
  price: number;
  sortOrder: number;
  nonCushionOnly: boolean;
  sizeKeys: BedSizeKey[] | null;
};

/** Client-safe: filter + price addons for a bed PDP. */
export function resolveShopBedAddons(input: {
  rows: { id: string; key: string; label: string; sortOrder: number }[];
  rangeSlug: string | null;
  cotType: "non_cushion" | "cushion" | null;
  widthSlug: string | null;
}): ShopBedAddon[] {
  const tier: BedAddonTier = input.rangeSlug
    ? bedRangeAddonTier(input.rangeSlug)
    : "standard";
  const sizeKey = input.widthSlug ? bedSizeKeyFromSlug(input.widthSlug) : null;
  const isCushion = input.cotType === "cushion";

  const out: ShopBedAddon[] = [];
  for (const row of input.rows) {
    const def = BED_ADDON_DEFS.find((d) => d.key === row.key);
    if (!def) continue;
    if (def.nonCushionOnly && isCushion) continue;
    if (def.sizeKeys?.length && sizeKey && !def.sizeKeys.includes(sizeKey)) {
      continue;
    }
    out.push({
      id: row.id,
      key: def.key,
      label: row.label,
      price: bedAddonPrice(tier, def.key),
      sortOrder: row.sortOrder,
      nonCushionOnly: Boolean(def.nonCushionOnly),
      sizeKeys: def.sizeKeys ? [...def.sizeKeys] : null,
    });
  }
  return out.sort((a, b) => a.sortOrder - b.sortOrder);
}
