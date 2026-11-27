"use client";

import { create } from "zustand";
import { getCartCountAction } from "@/app/(shop)/cart/actions";
import { getShortlistIdsAction } from "@/app/(shop)/shortlist/actions";

type ShopStore = {
  cartCount: number;
  shortlistIds: string[];
  isLoaded: boolean;
  load: () => Promise<void>;
  setCartCount: (count: number) => void;
  setShortlisted: (productId: string, isShortlisted: boolean) => void;
};

/** Header badges and heart buttons. The database stays the source of truth. */
export const useShopStore = create<ShopStore>((set, get) => ({
  cartCount: 0,
  shortlistIds: [],
  isLoaded: false,

  load: async () => {
    if (get().isLoaded) return;
    const [cartCount, shortlistIds] = await Promise.all([getCartCountAction(), getShortlistIdsAction()]);
    set({ cartCount, shortlistIds, isLoaded: true });
  },

  setCartCount: (cartCount) => set({ cartCount }),

  setShortlisted: (productId, isShortlisted) =>
    set((state) => ({
      shortlistIds: isShortlisted
        ? [productId, ...state.shortlistIds.filter((id) => id !== productId)]
        : state.shortlistIds.filter((id) => id !== productId),
    })),
}));
