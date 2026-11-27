// Source: docs/pricelist/cot-pricelist (from the client's two price list photos).
// Not seeded until the client confirms: Range 7, Range 8, the Cushion Back
// "Premium / Royal / Heavy cushion" extras, and an MRP for 78-inch sizes.

export type CotPriceList = "affordable" | "allCategories";

export type CotSizePrice = {
  size: CotSize;
  mrp: number | null;
  price: number;
  /** Added to the price for the 78-inch length. No value = no 78-inch option. */
  extraFor78?: number;
};

export type CotQualitySeed = {
  name: string;
  slug: string;
  description: string | null;
  warrantyYears: number | null;
  priceList: CotPriceList;
  prices: CotSizePrice[];
};

/** Base size of each label. Single has no size on the sheets. */
export const COT_SIZES = {
  King: { lengthIn: 75, widthIn: 72 },
  Queen: { lengthIn: 75, widthIn: 60 },
  Double: { lengthIn: 75, widthIn: 48 },
  "Singles-Jodi": { lengthIn: 75, widthIn: 36 },
  Single: { lengthIn: null, widthIn: null },
} as const;
export type CotSize = keyof typeof COT_SIZES;

export const COT_LONG_LENGTH_IN = 78;

/** Cot styles carried over from the current site (not on the client sheets). */
export const COT_STYLES = ["Classic", "Storage", "Platform"] as const;

function price(size: CotSize, mrp: number | null, sale: number, extraFor78?: number): CotSizePrice {
  return { size, mrp, price: sale, extraFor78 };
}

export const COT_QUALITIES: CotQualitySeed[] = [
  {
    name: "Ideal Range", slug: "ideal-range", warrantyYears: 2, priceList: "affordable",
    description: "Solid wood body · 15mm solid wood sheets & teak support",
    prices: [price("King", 26800, 18800, 1000), price("Queen", 24800, 16800, 900), price("Double", 22800, 14800, 600), price("Singles-Jodi", 27800, 19800), price("Single", null, 11800)],
  },
  {
    name: "Optimum Range", slug: "optimum-range", warrantyYears: 3, priceList: "affordable",
    description: "Solid wood body · 15mm solid wood sheets + teak supports + sides teak",
    prices: [price("King", 27800, 19800, 1200), price("Queen", 25800, 17800, 1000), price("Double", 23800, 16800, 900), price("Singles-Jodi", 28800, 20800), price("Single", null, 12800)],
  },
  {
    name: "Cushion Range", slug: "cushion-range", warrantyYears: 4, priceList: "affordable",
    description: "Solid wood body & teakwood legs · 15mm solid wood & bottom teak supports",
    prices: [price("King", 33800, 25800, 1200), price("Queen", 31800, 23800, 1000), price("Double", 29800, 21800, 900), price("Singles-Jodi", 34800, 26800), price("Single", null, 13800)],
  },
  {
    name: "Essential Range", slug: "essential-range", warrantyYears: 3, priceList: "allCategories",
    description: "Solid wood & fiber board body · 15mm solid wood sheets & teak support",
    prices: [price("King", 29800, 23800, 1200), price("Queen", 27800, 21800, 900), price("Double", 23800, 17800, 600), price("Singles-Jodi", 30800, 24800), price("Single", null, 12800)],
  },
  {
    name: "Prime Range", slug: "prime-range", warrantyYears: 5, priceList: "allCategories",
    description: "Teakwood body & hardwood at center · 18mm hardwood sheets & teak support",
    prices: [price("King", 33800, 27800, 1500), price("Queen", 31800, 25800, 1000), price("Double", 27800, 21800, 900), price("Singles-Jodi", 34800, 28800), price("Single", null, 14800)],
  },
  {
    name: "Premium Range", slug: "premium-range", warrantyYears: 5, priceList: "allCategories",
    description: "Teakwood body & heavy design at center · 18mm Gurjan hardwood & teak support",
    prices: [price("King", 39800, 33800, 1500), price("Queen", 37800, 31800, 1000), price("Double", 33800, 27800, 900), price("Singles-Jodi", 40800, 34800), price("Single", null, 17800)],
  },
  {
    name: "Royal Range", slug: "royal-range", warrantyYears: 8, priceList: "allCategories",
    description: "Total teakwood · 18mm Gurjan hardwood & teak support",
    prices: [price("King", 46800, 39800, 1900), price("Queen", 43800, 37800, 1600), price("Double", 39800, 33800, 1300)],
  },
  {
    name: "Cushion Back Range", slug: "cushion-back-range", warrantyYears: null, priceList: "allCategories",
    description: null,
    prices: [price("King", 40800, 37800), price("Queen", 39800, 35800), price("Double", 35800, 31800)],
  },
];

export type CotAddonSeed = {
  name: string;
  /** Only offered for this size. */
  sizeLabel: CotSize | null;
  prices: Record<CotPriceList, number>;
};

export const COT_ADDONS: CotAddonSeed[] = [
  { name: "King size (storage)", sizeLabel: "King", prices: { affordable: 5800, allCategories: 7800 } },
  { name: "Queen size (storage)", sizeLabel: "Queen", prices: { affordable: 4800, allCategories: 6800 } },
  { name: "Hydraulics (extra)", sizeLabel: null, prices: { affordable: 5500, allCategories: 7500 } },
  { name: "Mobile top", sizeLabel: null, prices: { affordable: 3500, allCategories: 4500 } },
  { name: "Headbox with storage boxes", sizeLabel: null, prices: { affordable: 4500, allCategories: 6500 } },
  { name: "Cushion head", sizeLabel: null, prices: { affordable: 3800, allCategories: 6800 } },
  { name: "Cushion foot", sizeLabel: null, prices: { affordable: 2800, allCategories: 4800 } },
  { name: "Full body cushion, King (extra)", sizeLabel: "King", prices: { affordable: 6800, allCategories: 6800 } },
  { name: "Full body cushion, Queen (extra)", sizeLabel: "Queen", prices: { affordable: 4800, allCategories: 4800 } },
];
