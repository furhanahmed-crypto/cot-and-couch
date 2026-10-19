"use client";

import { create } from "zustand";
import {
  getFavouriteIdsAction,
  toggleFavouriteAction,
} from "@/app/(shop)/favourites/actions";

type WishlistStore = {
  ids: string[];
  ready: boolean;
  loading: boolean;
  load: () => Promise<void>;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
};

/**
 * Wishlist store (UI/route still called “shortlist”).
 * DB `profile_favourites` remains the source of truth.
 */
export const useWishlistStore = create<WishlistStore>((set, get) => ({
  ids: [],
  ready: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const ids = await getFavouriteIdsAction();
      set({ ids, ready: true });
    } finally {
      set({ loading: false });
    }
  },

  has: (productId) => get().ids.includes(productId),

  toggle: (productId) => {
    const prev = get().ids;
    const liked = prev.includes(productId);
    set({
      ids: liked
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    });

    void toggleFavouriteAction(productId).then((result) => {
      if (!result.ok) {
        set({ ids: prev });
        return;
      }
      set((state) => {
        const hasId = state.ids.includes(productId);
        if (result.liked && !hasId) return { ids: [...state.ids, productId] };
        if (!result.liked && hasId) {
          return { ids: state.ids.filter((id) => id !== productId) };
        }
        return state;
      });
    });
  },
}));

export function selectWishlistCount(state: WishlistStore) {
  return state.ids.length;
}
