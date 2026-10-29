/**
 * Catalogue masters + product models for DB seed.
 * Live scope: mattresses + cots. Shop displays cots as “Beds”.
 */

export const CATEGORIES = [
  {
    name: "Mattresses",
    slug: "mattresses",
    sortOrder: 1,
    coverImage: "/images/mattresses/cover.jpg",
  },
  {
    name: "Cots",
    slug: "cots",
    sortOrder: 2,
    coverImage: "/images/cots/cover.jpg",
  },
] as const;

export const MATTRESS_BRANDS = [
  { name: "Wake Fit", slug: "wake-fit", sortOrder: 1 },
  { name: "Sleepwell", slug: "sleepwell", sortOrder: 2 },
  { name: "Livpure Smart", slug: "livpure-smart", sortOrder: 3 },
  { name: "Centuary Mattresses", slug: "centuary-mattresses", sortOrder: 4 },
  { name: "SleepyHug", slug: "sleepyhug", sortOrder: 5 },
  { name: "The Sleep Company", slug: "the-sleep-company", sortOrder: 6 },
] as const;

/**
 * Colour/finish master seed — PDF names wood finishes: teak, walnut, honey, natural.
 * Admin can add fabric colours later via Masters.
 */
export const COLOURS = [
  { label: "Teak", slug: "teak", hex: "#C19A6B" },
  { label: "Walnut", slug: "walnut", hex: "#5C4033" },
  { label: "Honey", slug: "honey", hex: "#E8B86D" },
  { label: "Natural", slug: "natural", hex: "#E8D5B7" },
] as const;

export const PURPOSES = [
  { label: "Sleeping", slug: "sleeping" },
  { label: "Pain relief", slug: "pain-relief" },
] as const;

export const SIZE_GROUPS = [
  { label: "Single", slug: "single" },
  { label: "Diwan", slug: "diwan" },
  { label: "Queen", slug: "queen" },
  { label: "King", slug: "king" },
  { label: "Custom", slug: "custom" },
] as const;

export const THICKNESSES = [
  { label: "4 inch", slug: "4-inch" },
  { label: "5 inch", slug: "5-inch" },
  { label: "6 inch", slug: "6-inch" },
  { label: "8 inch", slug: "8-inch" },
] as const;

export const COVER_MATERIALS = [
  { label: "Cotton", slug: "cotton" },
  { label: "Polyester", slug: "polyester" },
  { label: "Polycotton", slug: "polycotton" },
  { label: "Polyester Blend", slug: "polyester-blend" },
] as const;

export const FILLINGS = [
  { label: "Feather", slug: "feather" },
  { label: "Coir", slug: "coir" },
  { label: "Cotton", slug: "cotton" },
  { label: "Polyfoam", slug: "polyfoam" },
] as const;

export const COMFORTS = [
  { label: "Dual Comfort", slug: "dual-comfort" },
  { label: "Soft", slug: "soft" },
  { label: "Medium", slug: "medium" },
  { label: "Firm", slug: "firm" },
] as const;

/** Inch presets per size group (Custom has none). */
export const SIZE_DIMENSIONS: Record<string, [number, number][]> = {
  single: [
    [72, 30],
    [72, 35],
    [72, 36],
    [72, 42],
    [75, 30],
    [75, 35],
    [75, 36],
    [75, 42],
    [78, 30],
    [78, 35],
    [78, 36],
    [78, 42],
  ],
  diwan: [
    [72, 48],
    [75, 48],
    [78, 48],
  ],
  queen: [
    [72, 60],
    [72, 66],
    [75, 60],
    [75, 66],
    [78, 60],
    [78, 66],
    [84, 60],
  ],
  king: [
    [72, 70],
    [72, 72],
    [75, 70],
    [75, 72],
    [78, 70],
    [78, 72],
    [84, 72],
  ],
};

export type MattressModelSeed = {
  key: string;
  name: string;
  purpose: "sleeping" | "pain-relief";
  cover: string;
  filling: string;
  comfort: string;
};

/** 5 models per brand */
export const MATTRESS_MODELS: MattressModelSeed[] = [
  {
    key: "ortho-support",
    name: "Ortho Support",
    purpose: "pain-relief",
    cover: "cotton",
    filling: "coir",
    comfort: "firm",
  },
  {
    key: "cloud-soft",
    name: "Cloud Soft",
    purpose: "sleeping",
    cover: "polycotton",
    filling: "polyfoam",
    comfort: "soft",
  },
  {
    key: "dual-feel",
    name: "Dual Feel",
    purpose: "sleeping",
    cover: "polyester-blend",
    filling: "cotton",
    comfort: "dual-comfort",
  },
  {
    key: "everyday-medium",
    name: "Everyday Medium",
    purpose: "sleeping",
    cover: "polyester",
    filling: "polyfoam",
    comfort: "medium",
  },
  {
    key: "spine-care",
    name: "Spine Care",
    purpose: "pain-relief",
    cover: "cotton",
    filling: "coir",
    comfort: "firm",
  },
];

export function mattressImagePath(brandSlug: string, modelKey: string) {
  return `/images/mattresses/${brandSlug}/${modelKey}.jpg`;
}

export function productSlug(brandSlug: string, modelKey: string) {
  return `${brandSlug}-${modelKey}`;
}

/**
 * Mattress SKUs follow the product-editor HTML: size (L×W) × thickness only.
 * No colour/finish on mattresses (photos are one set per product).
 */
export const MATTRESS_SIZE_SKUS = [
  { size: "single", lengthIn: 72, widthIn: 36, mrp: 12999, price: 9999 },
  { size: "diwan", lengthIn: 75, widthIn: 48, mrp: 16999, price: 13999 },
  { size: "queen", lengthIn: 78, widthIn: 60, mrp: 24999, price: 19999 },
  { size: "king", lengthIn: 78, widthIn: 72, mrp: 29999, price: 23999 },
] as const;

/** Thicknesses offered on each mattress model in seed (HTML demo: 6 in · 8 in). */
export const MATTRESS_THICKNESS_SKUS = ["6-inch", "8-inch"] as const;

export const MATTRESS_THICKNESS_ADD = {
  "4-inch": 0,
  "5-inch": 800,
  "6-inch": 0,
  "8-inch": 4000,
} as const;

export function mattressPrice(
  sizePlan: (typeof MATTRESS_SIZE_SKUS)[number],
  thickness: (typeof MATTRESS_THICKNESS_SKUS)[number],
) {
  const add = MATTRESS_THICKNESS_ADD[thickness];
  return { mrp: sizePlan.mrp + add, price: sizePlan.price + add };
}

