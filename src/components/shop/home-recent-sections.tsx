"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { getProductsByIdsAction } from "@/app/(shop)/catalogue/actions";
import type { Product } from "@/types";

export function HomeRecentSections({ featured }: { featured: Product[] }) {
  const { ids: recentIds } = useRecentlyViewed();
  const [recent, setRecent] = useState<Product[]>([]);

  useEffect(() => {
    if (!recentIds.length) {
      setRecent([]);
      return;
    }
    let cancelled = false;
    getProductsByIdsAction(recentIds.slice(0, 8)).then((products) => {
      if (!cancelled) setRecent(products);
    });
    return () => {
      cancelled = true;
    };
  }, [recentIds]);

  const inspired = featured
    .filter((p) => !recentIds.includes(p.id))
    .slice(0, 4);

  return (
    <>
      {recent.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-2xl">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recent.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {inspired.length > 0 && recentIds.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-2xl">
            Inspired by your browsing
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {inspired.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
