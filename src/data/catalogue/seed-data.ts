/**
 * Single source of truth for catalogue masters + product models.
 * Used by DB seed and mock shop data.
 */

export const CATEGORIES = [
  { name: "Mattresses", slug: "mattresses", sortOrder: 1, coverImage: "/images/mattresses/cover.jpg" },
  { name: "Cots", slug: "cots", sortOrder: 2, coverImage: "/images/cots/cover.jpg" },
  { name: "Sofas", slug: "sofas", sortOrder: 3, coverImage: "/images/sofas/cover.jpg" },
  {
    name: "Computer Tables",
    slug: "computer-tables",
    sortOrder: 4,
    coverImage: "/images/computer-tables/cover.jpg",
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
 * Mattress pricing by size group + thickness only.
 * Colour never changes price — seed expands every colour at the same MRP/offer.
 */
export const MATTRESS_SIZE_BASE = {
  single: { mrp: 12999, price: 9999 },
  diwan: { mrp: 16999, price: 13999 },
  queen: { mrp: 24999, price: 19999 },
  king: { mrp: 29999, price: 23999 },
  custom: { mrp: 27999, price: 22999 },
} as const;

/** Added on top of size base (same for every colour / dimension in that group). */
export const MATTRESS_THICKNESS_ADD = {
  "4-inch": 0,
  "5-inch": 800,
  "6-inch": 2000,
  "8-inch": 4000,
} as const;

export function mattressPrice(
  size: keyof typeof MATTRESS_SIZE_BASE,
  thickness: keyof typeof MATTRESS_THICKNESS_ADD,
) {
  const base = MATTRESS_SIZE_BASE[size];
  const add = MATTRESS_THICKNESS_ADD[thickness];
  return { mrp: base.mrp + add, price: base.price + add };
}

/** House-made product (mattress_brand_id null). */
export type HouseModelSeed = {
  key: string;
  name: string;
  description: string;
  /** Free-form specs for shop mock (not separate option groups yet). */
  specs: Record<string, string>;
};

/** Cots — size + colour SKUs; no mattress attrs / no thickness. */
export const COT_MODELS: HouseModelSeed[] = [
  {
    key: "amber-teak",
    name: "Amber Teak Cot",
    description: "Solid teak cot with clean lines — house-made at Cot & Couch.",
    specs: { storage: "none", headboard: "wooden" },
  },
  {
    key: "nara-platform",
    name: "Nara Platform Cot",
    description: "Low platform cot for compact bedrooms.",
    specs: { storage: "none", headboard: "wooden" },
  },
  {
    key: "loft-storage",
    name: "Loft Storage Cot",
    description: "Drawer storage under the frame for everyday clutter.",
    specs: { storage: "drawer", headboard: "wooden" },
  },
  {
    key: "cedar-box",
    name: "Cedar Box Cot",
    description: "Full box storage cot with soft upholstered headboard.",
    specs: { storage: "box", headboard: "upholstered" },
  },
  {
    key: "pulse-hydraulic",
    name: "Pulse Hydraulic Cot",
    description: "Hydraulic lift storage — sit-test the gas springs in-store.",
    specs: { storage: "hydraulic", headboard: "wooden" },
  },
  {
    key: "ivory-softback",
    name: "Ivory Softback Cot",
    description: "Upholstered softback cot for a calmer bedroom look.",
    specs: { storage: "none", headboard: "upholstered" },
  },
  {
    key: "regal-carved",
    name: "Regal Carved Cot",
    description: "Carved teak statement cot from the Royal Range.",
    specs: { storage: "none", headboard: "carved" },
  },
  {
    key: "willow-single",
    name: "Willow Single Cot",
    description: "Compact single cot for guest rooms and kids.",
    specs: { storage: "none", headboard: "wooden" },
  },
];

/** Cot size SKUs — seed expands every colour at the same price. */
export const COT_VARIANT_PLANS = [
  {
    size: "single",
    lengthIn: 72,
    widthIn: 36,
    mrp: 28999,
    price: 23999,
  },
  {
    size: "queen",
    lengthIn: 78,
    widthIn: 60,
    mrp: 54999,
    price: 44999,
  },
  {
    size: "king",
    lengthIn: 78,
    widthIn: 72,
    mrp: 68999,
    price: 56999,
  },
  {
    size: "custom",
    lengthIn: null as number | null,
    widthIn: null as number | null,
    mrp: 64999,
    price: 52999,
  },
] as const;

/** Sofas — colour SKUs on custom size group (seating in product specs). */
export const SOFA_MODELS: HouseModelSeed[] = [
  {
    key: "noir-3-seater",
    name: "Noir 3-Seater Sofa",
    description: "Deep walnut-tone 3-seater — fabric feel checked in the showroom.",
    specs: { seating: "3", upholstery: "fabric", frame: "teak" },
  },
  {
    key: "pearl-2-seater",
    name: "Pearl 2-Seater Sofa",
    description: "Compact 2-seater for apartments and reading nooks.",
    specs: { seating: "2", upholstery: "fabric", frame: "engineered" },
  },
  {
    key: "cascade-l-shape",
    name: "Cascade L-Shape Sofa",
    description: "Corner L-shape for family living rooms.",
    specs: { seating: "L-shape", upholstery: "velvet", frame: "teak" },
  },
  {
    key: "foldaway-cum-bed",
    name: "FoldAway Sofa-Cum-Bed",
    description: "Day sofa that opens into a guest bed.",
    specs: { seating: "3", upholstery: "fabric", frame: "engineered" },
  },
  {
    key: "lounge-recliner",
    name: "Lounge Recliner",
    description: "Single recliner with soft leatherette wrap.",
    specs: { seating: "recliner", upholstery: "leatherette", frame: "engineered" },
  },
  {
    key: "linen-3-seater",
    name: "Linen Soft 3-Seater",
    description: "Breathable linen-look fabric on a sheesham frame.",
    specs: { seating: "3", upholstery: "fabric", frame: "sheesham" },
  },
  {
    key: "horizon-l-shape",
    name: "Horizon L-Shape Sofa",
    description: "Low-profile L-shape with firm seat foam.",
    specs: { seating: "L-shape", upholstery: "fabric", frame: "engineered" },
  },
  {
    key: "velvet-haven",
    name: "Velvet Haven 3-Seater",
    description: "Plush velvet 3-seater for the Royal Range look.",
    specs: { seating: "3", upholstery: "velvet", frame: "teak" },
  },
];

/** One price per sofa model; seed expands every colour at this price. */
export const SOFA_VARIANT_PRICE = { mrp: 52999, price: 42999 } as const;

/** Computer tables — colour SKUs on custom size group (shape in product specs). */
export const TABLE_MODELS: HouseModelSeed[] = [
  {
    key: "pixel-straight",
    name: "Pixel Straight Desk",
    description: "Straight computer table with clean cable drop.",
    specs: { shape: "straight", widthBand: "100–120", keyboardTray: "yes" },
  },
  {
    key: "focus-study",
    name: "Focus Study Desk",
    description: "Compact study desk for kids and WFH corners.",
    specs: { shape: "straight", widthBand: "under 100", keyboardTray: "yes" },
  },
  {
    key: "corner-pro-l",
    name: "Corner Pro L-Desk",
    description: "L-shape workstation with CPU bay.",
    specs: { shape: "L", widthBand: "120+", keyboardTray: "yes" },
  },
  {
    key: "cable-smart",
    name: "CableSmart Computer Desk",
    description: "Built-in cable tray and grommets for tidy setups.",
    specs: { shape: "straight", widthBand: "100–120", keyboardTray: "yes" },
  },
  {
    key: "wing-l",
    name: "Wing L-Shape Desk",
    description: "Wide L-desk for dual monitors.",
    specs: { shape: "L", widthBand: "120+", keyboardTray: "yes" },
  },
  {
    key: "metro-computer",
    name: "Metro Computer Desk",
    description: "Slim straight desk for small rooms.",
    specs: { shape: "straight", widthBand: "under 100", keyboardTray: "yes" },
  },
];

/** One price per table model; seed expands every colour at this price. */
export const TABLE_VARIANT_PRICE = { mrp: 16999, price: 13999 } as const;

export function houseImagePath(
  categorySlug: "cots" | "sofas" | "computer-tables",
  modelKey: string,
) {
  return `/images/${categorySlug}/${modelKey}.jpg`;
}

export function houseProductSlug(
  categorySlug: "cots" | "sofas" | "computer-tables",
  modelKey: string,
) {
  return `${categorySlug}-${modelKey}`;
}
