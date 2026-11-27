import type { PriceUnit } from "@/constants/products";

/** A variant the seed created, with what an order snapshot needs. */
export type SeededVariant = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  sizeLabel: string;
  seats: number | null;
  qualityId: string | null;
  qualityName: string | null;
  colourName: string | null;
  mrp: number | null;
  price: number;
};

export type SeededAddon = {
  id: string;
  name: string;
  priceUnit: PriceUnit;
  /** Price by quality id. */
  prices: Record<string, number>;
};

export type SeededCategory = {
  productIds: string[];
  variants: SeededVariant[];
  addons: SeededAddon[];
};
