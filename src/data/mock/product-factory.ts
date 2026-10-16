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
  mattressBrandId?: string | null;
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
    sizeGroupOptionId?: string;
    sizeGroupLabel?: string;
    sizeGroupSlug?: string;
    sizeDimensionId?: string | null;
    sizeDimensionLabel?: string | null;
    isCustomSize?: boolean;
    thicknessOptionId?: string | null;
    thicknessLabel?: string | null;
    sizeId?: string;
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
    mattressBrandId: seed.mattressBrandId ?? null,
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
        sizeGroupOptionId: v.sizeGroupOptionId ?? "sg-default",
        sizeGroupLabel: v.sizeGroupLabel ?? "Size",
        sizeGroupSlug: v.sizeGroupSlug ?? "custom",
        sizeDimensionId: v.sizeDimensionId ?? v.sizeId ?? null,
        sizeDimensionLabel: v.sizeDimensionLabel ?? null,
        isCustomSize: v.isCustomSize ?? !v.sizeId,
        thicknessOptionId: v.thicknessOptionId ?? null,
        thicknessLabel: v.thicknessLabel ?? null,
        maxDiscountPercent: v.maxDiscountPercent ?? 25,
        ...v,
      }),
    ),
  };
}
