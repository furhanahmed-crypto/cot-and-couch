import type { Product, StockStatus, Variant } from "@/types";

export const img = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

type Seed = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  collectionId: string;
  brandId?: string;
  highlights: string[];
  description: string;
  dimensions: Product["dimensions"];
  material: string;
  finish: string;
  warrantyYears?: number;
  assembly?: Product["assembly"];
  deliveryDays?: string;
  care?: string;
  specs: Product["specs"];
  tags?: string[];
  featured?: boolean;
  popularity: number;
  relatedIds?: string[];
  completeRoomIds?: string[];
  createdAt: string;
  variants: {
    id: string;
    sku: string;
    colourId: string;
    sizeId?: string;
    configuration?: string;
    mrp: number;
    price: number;
    maxDiscountPercent?: number;
    stockQty: number;
    stockStatus: StockStatus;
    images: string[];
    madeToOrderDays?: [number, number];
  }[];
};

export function makeProduct(seed: Seed): Product {
  return {
    brandId: seed.brandId ?? "b-cc",
    warrantyYears: seed.warrantyYears ?? 2,
    warrantyExclusions: "Misuse, stains, water damage",
    assembly: seed.assembly ?? "carpenter",
    deliveryDays: seed.deliveryDays ?? "5–12 days within Hyderabad",
    care: seed.care ?? "Dust with a soft cloth. Avoid harsh chemicals.",
    tags: seed.tags ?? [],
    featured: seed.featured ?? false,
    status: "published",
    relatedIds: seed.relatedIds ?? [],
    completeRoomIds: seed.completeRoomIds ?? [],
    ...seed,
    variants: seed.variants.map(
      (v): Variant => ({
        maxDiscountPercent: v.maxDiscountPercent ?? 25,
        ...v,
      }),
    ),
  };
}
