// Source: docs/pricelist/sofa-pricelist (from the client's sofa PDF).
// "Classic Sofa" is a placeholder name until the client names that range.
import type { AddonKind, PriceUnit } from "@/constants/products";

export const SOFA_QUALITIES = [
  { name: "Affordable", slug: "affordable" },
  { name: "Premium", slug: "premium" },
] as const;
export type SofaQualitySlug = (typeof SOFA_QUALITIES)[number]["slug"];

export type SofaVariantSeed = {
  /** The "Model" column of the price list. */
  sizeLabel: string;
  /** Null when the sheet gives no whole number (e.g. "3 + lounger"). */
  seats: number | null;
  quality: SofaQualitySlug;
  price: number;
};

export type SofaAddonSeed = {
  name: string;
  kind: AddonKind;
  priceUnit: PriceUnit;
  /** No entry for a quality = not offered for that quality. */
  prices: Partial<Record<SofaQualitySlug, number>>;
};

export type SofaProductSeed = {
  name: string;
  slug: string;
  variants: SofaVariantSeed[];
  addons: SofaAddonSeed[];
};

export const SOFA_PRODUCTS: SofaProductSeed[] = [
  {
    name: "Classic Sofa",
    slug: "classic-sofa",
    variants: [
      { sizeLabel: "3+1+1 / 3+2", seats: 5, quality: "affordable", price: 29800 },
      { sizeLabel: "3-Seater", seats: 3, quality: "affordable", price: 18800 },
      { sizeLabel: "3+1+1 / 3+2", seats: 5, quality: "premium", price: 35800 },
      { sizeLabel: "3-Seater", seats: 3, quality: "premium", price: 22800 },
    ],
    addons: [
      { name: "Manual recliner", kind: "recliner", priceUnit: "fixed", prices: { affordable: 21800, premium: 25800 } },
      { name: "Motorized recliner", kind: "recliner", priceUnit: "fixed", prices: { affordable: 25800, premium: 29800 } },
      { name: "RRR", kind: "recliner", priceUnit: "fixed", prices: { affordable: 25800, premium: 27800 } },
      { name: "Add bed", kind: "addon", priceUnit: "fixed", prices: { affordable: 14500, premium: 14500 } },
      { name: "L-shape sofa (extra for corner)", kind: "addon", priceUnit: "fixed", prices: { affordable: 2500, premium: 3500 } },
    ],
  },
  {
    name: "Luxury High Back",
    slug: "luxury-high-back",
    variants: [
      { sizeLabel: "3+1+1 / 3+2", seats: 5, quality: "affordable", price: 49800 },
      { sizeLabel: "3+1+1 / 3+2", seats: 5, quality: "premium", price: 59800 },
    ],
    addons: [
      { name: "Add manual recliner", kind: "recliner", priceUnit: "per_seat", prices: { affordable: 9000, premium: 9000 } },
      { name: "Add motor", kind: "recliner", priceUnit: "per_seat", prices: { affordable: 14500, premium: 14500 } },
      { name: "Add bed", kind: "addon", priceUnit: "fixed", prices: { affordable: 16500, premium: 16500 } },
      { name: "Center cup holders (extra)", kind: "addon", priceUnit: "fixed", prices: { affordable: 3500 } },
      { name: "Matching center table (3 x 2 ft)", kind: "addon", priceUnit: "fixed", prices: { premium: 12000 } },
    ],
  },
  {
    name: "Sofacumbed",
    slug: "sofacumbed",
    variants: [
      { sizeLabel: "3-Seater Sofacumbed", seats: 3, quality: "affordable", price: 34800 },
      { sizeLabel: "3-Seater Sofacumbed", seats: 3, quality: "premium", price: 39800 },
      { sizeLabel: "Sofacumbed + Lounger", seats: null, quality: "affordable", price: 44800 },
      { sizeLabel: "Sofacumbed + Lounger", seats: null, quality: "premium", price: 49800 },
      { sizeLabel: "3 Seat + Lounger (without bed)", seats: null, quality: "affordable", price: 39800 },
    ],
    addons: [
      { name: "Matching center table (3 x 2 ft)", kind: "addon", priceUnit: "fixed", prices: { affordable: 12000, premium: 12000 } },
    ],
  },
  {
    name: "Teak Sofa",
    slug: "teak-sofa",
    variants: [
      { sizeLabel: "Teakwood Sofa — Fixed Cushion (3+1+1)", seats: 5, quality: "affordable", price: 27800 },
      { sizeLabel: "Teak Sofa — Detach (3+1+1)", seats: 5, quality: "premium", price: 44800 },
    ],
    addons: [],
  },
  {
    name: "3-Step Extend Sofa",
    slug: "3-step-extend-sofa",
    variants: [
      { sizeLabel: "3 Seat — 6 x 6 ft", seats: 3, quality: "affordable", price: 39800 },
      { sizeLabel: "3 Seat — 6 x 6 ft", seats: 3, quality: "premium", price: 45800 },
    ],
    addons: [],
  },
];
