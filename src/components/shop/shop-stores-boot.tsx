"use client";

import { useEffect } from "react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

/** Loads cart + wishlist once for the shop shell (no React Context). */
export function ShopStoresBoot() {
  const loadCart = useCartStore((s) => s.load);
  const loadWishlist = useWishlistStore((s) => s.load);

  useEffect(() => {
    void loadCart();
    void loadWishlist();
  }, [loadCart, loadWishlist]);

  return null;
}
