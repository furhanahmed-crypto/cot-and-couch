"use client";

import { useEffect } from "react";
import { useShopStore } from "@/stores/shop-store";

/** Loads the cart count and shortlist once for the shop shell. */
export function ShopStoresBoot() {
  const load = useShopStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return null;
}
