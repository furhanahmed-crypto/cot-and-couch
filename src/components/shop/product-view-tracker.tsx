"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

export function ProductViewTracker({ productId }: { productId: string }) {
  const { track } = useRecentlyViewed();
  useEffect(() => {
    track(productId);
  }, [productId, track]);
  return null;
}
