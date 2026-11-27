"use client";

import { useEffect, useState } from "react";
import { getProductCardsByIdsAction } from "@/app/(shop)/actions";
import { ProductCard } from "@/components/shop/product-card";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import type { ProductCardItem } from "@/types/catalogue";

/** Products this browser viewed recently (ids kept in localStorage). */
export function HomeRecentSections() {
  const { ids } = useRecentlyViewed();
  const idsKey = ids.join(",");
  const [loaded, setLoaded] = useState<{ key: string; cards: ProductCardItem[] }>({ key: "", cards: [] });

  useEffect(() => {
    if (!idsKey) return;
    let isCancelled = false;
    getProductCardsByIdsAction(idsKey.split(",")).then((cards) => {
      if (!isCancelled) setLoaded({ key: idsKey, cards });
    });
    return () => {
      isCancelled = true;
    };
  }, [idsKey]);

  // Cards for an older id list are not shown.
  const cards = loaded.key === idsKey ? loaded.cards : [];
  if (!cards.length) return null;

  return (
    <section>
      <h2 className="mb-4 font-heading text-2xl">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <ProductCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
