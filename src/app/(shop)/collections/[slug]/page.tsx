import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import {
  CollectionPageSkeleton,
  ReelsStripSkeleton,
} from "@/components/shop/shop-skeletons";
import {
  getCollectionBySlug,
  getProductsByCollectionSlug,
} from "@/services/catalogue";
import { getCollections } from "@/services/ops";

export async function generateStaticParams() {
  try {
    const collections = await getCollections();
    return collections.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

async function CollectionContent({ slug }: { slug: string }) {
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const list = await getProductsByCollectionSlug(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-8 max-w-2xl space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">
          Collection
        </p>
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
        <Suspense fallback={<ReelsStripSkeleton />}>
          <ReelsStrip tag={collection.slug} />
        </Suspense>
      </div>
    </div>
  );
}

async function CollectionFromParams({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionContent slug={slug} />;
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<CollectionPageSkeleton />}>
      <CollectionFromParams params={params} />
    </Suspense>
  );
}
