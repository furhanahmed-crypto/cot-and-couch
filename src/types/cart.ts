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
  /** Selected bed quality/range for sheet pricing. */
  bedRangeId?: string | null;
};

export type CartSummaryLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  bedRangeId: string | null;
  addonIds: string[];
};

export type CartLine = {
  id: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  bedRangeId: string | null;
  bedRangeName: string | null;
  bedRangeSlug: string | null;
  /** Unit body price after range sheet (before addons). */
  unitPrice: number;
  unitMrp: number;
  addons: CartLineAddon[];
  product: Product;
  variant: Variant;
};
