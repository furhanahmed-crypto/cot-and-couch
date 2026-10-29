import type { Product, Variant } from "@/types";

export type CartLineAddon = {
  addonId: string;
  label: string;
  price: number;
};

export type AddToCartInput = {
  productId: string;
  variantId: string;
  quantity?: number;
  customLengthIn?: number | null;
  customWidthIn?: number | null;
  /** Selected category addon ids (beds: storage / cushion extras). */
  addonIds?: string[];
};

export type CartSummaryLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  addonIds: string[];
};

export type CartLine = {
  id: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  addons: CartLineAddon[];
  product: Product;
  variant: Variant;
};
