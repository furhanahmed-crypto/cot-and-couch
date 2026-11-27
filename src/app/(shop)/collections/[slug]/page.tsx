import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { CollectionPageSkeleton, ReelsStripSkeleton } from "@/components/shop/shop-skeletons";
import { listProductCardsByCollection } from "@/services/catalogue/product-card-queries";
import { getCollectionBySlug, listCollections } from "@/services/collections/queries";

// Cache Components needs at least one param. With no collections (or no DB at
// build time) a placeholder is used; the page shows notFound() for it.
const PLACEHOLDER_PARAMS = [{ slug: "__placeholder__" }];

export async function generateStaticParams() {
  try {
    const collections = await listCollections();
    const params = collections.map((collection) => ({ slug: collection.slug }));
    return params.length ? params : PLACEHOLDER_PARAMS;
  } catch {
    return PLACEHOLDER_PARAMS;
  }
}

async function CollectionContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();
  const cards = await listProductCardsByCollection(collection.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Collection</p>
        <h1 className="font-heading text-3xl md:text-4xl">{collection.name}</h1>
        {collection.description ? <p className="text-muted-foreground">{collection.description}</p> : null}
        <p className="text-sm text-muted-foreground">{cards.length} products</p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No products in this collection yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
        </div>
      )}

      <div className="mt-12">
        <Suspense fallback={<ReelsStripSkeleton />}>
          <ReelsStrip tag={collection.slug} />
        </Suspense>
      </div>
    </div>
  );
}

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<CollectionPageSkeleton />}>
      <CollectionContent params={params} />
    </Suspense>
  );
}
