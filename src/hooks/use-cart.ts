"use client";

import { useCartStore, selectCartCount } from "@/stores/cart-store";

export function useCart() {
  const lines = useCartStore((s) => s.lines);
  const ready = useCartStore((s) => s.ready);
  const count = useCartStore(selectCartCount);
  const refresh = useCartStore((s) => s.refresh);
  const findLine = useCartStore((s) => s.findLine);
  const addItem = useCartStore((s) => s.addItem);

  return {
    lines,
    ready,
    count,
    refreshLines: refresh,
    findLine,
    addItem,
  };
}
