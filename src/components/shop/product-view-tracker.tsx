"use client";

import { useEffect } from "react";
import { trackProductViewAction } from "@/app/(shop)/actions";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";

/** Remembers the view in this browser and on the customer's lead. */
export function ProductViewTracker({ productId }: { productId: string }) {
  const { track } = useRecentlyViewed();
  useEffect(() => {
    track(productId);
    void trackProductViewAction(productId);
  }, [productId, track]);
  return null;
}
