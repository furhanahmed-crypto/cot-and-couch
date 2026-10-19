"use client";

import { create } from "zustand";
import {
  addToCartAction,
  getCartSummaryAction,
} from "@/app/(shop)/cart/actions";
import { findSummaryLine } from "@/lib/cart-find";
import type { AddToCartInput, CartSummaryLine } from "@/types/cart";

type CartStore = {
  lines: CartSummaryLine[];
  ready: boolean;
  loading: boolean;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  findLine: (
    productId: string,
    variantId?: string,
    customLengthIn?: number | null,
    customWidthIn?: number | null,
  ) => CartSummaryLine | null;
  addItem: (input: AddToCartInput) => Promise<{ ok: boolean; error?: string }>;
};

export const useCartStore = create<CartStore>((set, get) => ({
  lines: [],
  ready: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const lines = await getCartSummaryAction();
      set({ lines, ready: true });
    } finally {
      set({ loading: false });
    }
  },

  refresh: async () => {
    const lines = await getCartSummaryAction();
    set({ lines, ready: true });
  },

  findLine: (
    productId,
    variantId,
    customLengthIn = null,
    customWidthIn = null,
  ) =>
    findSummaryLine(
      get().lines,
      productId,
      variantId,
      customLengthIn,
      customWidthIn,
    ),

  addItem: async (input) => {
    const result = await addToCartAction(input);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    await get().refresh();
    return { ok: true };
  },
}));

export function selectCartCount(state: CartStore) {
  return state.lines.length;
}
