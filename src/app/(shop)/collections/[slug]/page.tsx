"use client";

import { use, useMemo } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import {
  getCollectionBySlug,
  getPublishedProducts,
} from "@/services/catalogue";

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const collection = getCollectionBySlug(slug);
  const list = useMemo(() => {
    if (!collection) return [];
    return getPublishedProducts().filter((p) => p.collectionId === collection.id);
  }, [collection]);

  if (!collection) {
    return <p className="p-8 text-center text-muted-foreground">Collection not found.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Collection</p>
        <h1 className="font-heading text-3xl md:text-4xl">{collection.name}</h1>
        <p className="text-muted-foreground">{collection.description}</p>
        <p className="text-sm text-muted-foreground">{list.length} products</p>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No published products in this collection yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div className="mt-12">
        <ReelsStrip tag={collection.slug} />
      </div>
    </div>
  );
}
