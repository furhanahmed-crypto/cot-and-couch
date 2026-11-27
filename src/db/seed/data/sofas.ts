// Source: docs/client/sofa-price-list-nov-2026.pdf ("Sofa Price List - All Ranges and Categories").
// Each row of the sheet's RANGE column is one product, named as on the sheet.
// The "(… /SEAT)" figures are information only and are not stored.
import type { AddonKind, PriceUnit } from "@/constants/products";

type SofaVariantSeed = {
  /** The "Model" column of the price list. */
  sizeLabel: string;
  /** Null when the sheet gives no whole number (e.g. a lounger). */
  seats: number | null;
  price: number;
};

type SofaAddonSeed = { name: string; kind: AddonKind; priceUnit: PriceUnit; price: number };

export type SofaProductSeed = {
  name: string;
  slug: string;
  variants: SofaVariantSeed[];
  addons: SofaAddonSeed[];
};

const recliner = (name: string, price: number, priceUnit: PriceUnit = "fixed"): SofaAddonSeed => ({ name, kind: "recliner", priceUnit, price });
const option = (name: string, price: number): SofaAddonSeed => ({ name, kind: "addon", priceUnit: "fixed", price });
const CENTER_TABLE = option("Matching center table (3 x 2 ft)", 12000);

export const SOFA_PRODUCTS: SofaProductSeed[] = [
  {
    name: "Affordable Sofa", slug: "affordable-sofa",
    variants: [{ sizeLabel: "3+1+1 / 3+2", seats: 5, price: 29800 }, { sizeLabel: "3-Seater", seats: 3, price: 18800 }],
    addons: [
      recliner("Manual recliner", 21800), recliner("Motorized recliner", 25800), recliner("RRR", 25800),
      option("Add bed", 14500), option("L-shape sofa (extra for corner)", 2500),
    ],
  },
  {
    name: "Premium Sofa", slug: "premium-sofa",
    variants: [{ sizeLabel: "3+1+1 / 3+2", seats: 5, price: 35800 }, { sizeLabel: "3-Seater", seats: 3, price: 22800 }],
    addons: [
      recliner("Manual recliner", 25800), recliner("Motor recliner", 29800), recliner("RRR", 27800),
      option("Add bed", 14500), option("L-shape sofa (extra for corner)", 3500),
    ],
  },
  {
    name: "Luxury High Back", slug: "luxury-high-back",
    variants: [{ sizeLabel: "3+1+1 / 3+2", seats: 5, price: 49800 }],
    addons: [
      recliner("Add manual recliner", 9000, "per_seat"), recliner("Add motor", 14500, "per_seat"),
      option("Add bed", 16500), option("Center cup holders (extra)", 3500),
    ],
  },
  {
    name: "Premium Luxury High Back", slug: "premium-luxury-high-back",
    variants: [{ sizeLabel: "3+1+1 / 3+2", seats: 5, price: 59800 }],
    addons: [recliner("Add manual recliner", 9000, "per_seat"), recliner("Add motor", 14500, "per_seat"), option("Add bed", 16500), CENTER_TABLE],
  },
  { name: "3-Seater Sofacumbed", slug: "3-seater-sofacumbed", variants: [{ sizeLabel: "Sofacumbed", seats: 3, price: 34800 }], addons: [CENTER_TABLE] },
  {
    name: "Sofacumbed + Lounger", slug: "sofacumbed-lounger",
    variants: [{ sizeLabel: "Bed + Lounger", seats: null, price: 44800 }, { sizeLabel: "3 Seat + Lounger (without bed)", seats: null, price: 39800 }],
    addons: [CENTER_TABLE],
  },
  { name: "Premium 3-Seat Cumbed", slug: "premium-3-seat-cumbed", variants: [{ sizeLabel: "Sofacumbed – Premium", seats: 3, price: 39800 }], addons: [CENTER_TABLE] },
  { name: "Premium 3-Seat Cumbed + Lounger", slug: "premium-3-seat-cumbed-lounger", variants: [{ sizeLabel: "Cumbed + Lounger", seats: null, price: 49800 }], addons: [CENTER_TABLE] },
  { name: "Teakwood Sofa – Fixed Cushion", slug: "teakwood-sofa-fixed-cushion", variants: [{ sizeLabel: "3+1+1", seats: 5, price: 27800 }], addons: [] },
  { name: "Teak Sofa – Detach", slug: "teak-sofa-detach", variants: [{ sizeLabel: "3+1+1", seats: 5, price: 44800 }], addons: [] },
  { name: "3-Step Extend Sofa – Regular", slug: "3-step-extend-sofa-regular", variants: [{ sizeLabel: "3 Seat – 6 x 6 ft", seats: 3, price: 39800 }], addons: [] },
  { name: "3-Step Extend Sofa – Premium", slug: "3-step-extend-sofa-premium", variants: [{ sizeLabel: "3 Seat – 6 x 6 ft", seats: 3, price: 45800 }], addons: [] },
];
