"use client";

import { use, useEffect } from "react";
import { PdpCtaBar } from "@/components/shop/pdp-cta-bar";
import { PdpMain } from "@/components/shop/pdp-main";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { ROUTES } from "@/constants/routes";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { getProductBySlug, getProductsByIds } from "@/services/catalogue";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const { track } = useRecentlyViewed();

  useEffect(() => {
    if (product) track(product.id);
  }, [product, track]);

  if (!product) {
    return (
      <p className="p-8 text-center text-muted-foreground">Product not found.</p>
    );
  }

  const related = getProductsByIds(product.relatedIds);
  const completeRoom = getProductsByIds(product.completeRoomIds);
  const productUrl = ROUTES.product(product.slug);

  return (
    <div className="pb-28">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <PdpMain product={product} />

        {related.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="font-heading text-xl">You may also like</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {completeRoom.length > 0 && (
          <section className="mt-12 space-y-4">
            <h2 className="font-heading text-xl">Complete the room</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {completeRoom.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <ReelsStrip tag={product.id} />
        </div>
      </div>

      <PdpCtaBar productName={product.name} productUrl={productUrl} />
    </div>
  );
}
