import type { Product, Variant } from "@/types";

export type AddToCartInput = {
  productId: string;
  variantId: string;
  quantity?: number;
  customLengthIn?: number | null;
  customWidthIn?: number | null;
};

export type CartSummaryLine = {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
};

export type CartLine = {
  id: string;
  quantity: number;
  customLengthIn: number | null;
  customWidthIn: number | null;
  product: Product;
  variant: Variant;
};
