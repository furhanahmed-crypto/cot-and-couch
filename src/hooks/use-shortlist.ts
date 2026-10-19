"use client";

import { useWishlistStore, selectWishlistCount } from "@/stores/wishlist-store";

/** Shortlist UI hook — backed by the wishlist Zustand store. */
export function useShortlist() {
  const ids = useWishlistStore((s) => s.ids);
  const ready = useWishlistStore((s) => s.ready);
  const count = useWishlistStore(selectWishlistCount);
  const has = useWishlistStore((s) => s.has);
  const toggle = useWishlistStore((s) => s.toggle);

  return { ids, ready, count, has, toggle };
}
