import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { HomeContinueBrowse } from "@/components/shop/home-continue-browse";
import { HomeHero } from "@/components/shop/home-hero";
import { HomeRecentSections } from "@/components/shop/home-recent-sections";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { HomePageSkeleton, ReelsStripSkeleton } from "@/components/shop/shop-skeletons";
import { StoreBlock } from "@/components/shop/store-block";
import { ROUTES } from "@/constants/routes";
import { listCategories } from "@/services/catalogue/category-queries";
import { listFeaturedProductCards, listProductCardsByCollection } from "@/services/catalogue/product-card-queries";
import { listCollections } from "@/services/collections/queries";
import { listGalleryPhotos } from "@/services/media/queries";
import type { CollectionItem } from "@/types/catalogue";

const FEATURED_LIMIT = 8;
const COLLECTION_LIMIT = 6;

async function CollectionSection({ collection }: { collection: CollectionItem }) {
  const cards = (await listProductCardsByCollection(collection.id)).slice(0, COLLECTION_LIMIT);
  if (!cards.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brass">Collection</p>
          <h2 className="font-heading text-2xl">{collection.name}</h2>
        </div>
        <Link href={ROUTES.collection(collection.slug)} className="text-sm text-muted-foreground hover:text-foreground">
          Explore
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <ProductCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

async function HomeContent() {
  const [categories, featured, collections, gallery] = await Promise.all([
    listCategories(),
    listFeaturedProductCards(),
    listCollections(),
    listGalleryPhotos(),
  ]);
  const featuredCards = featured.slice(0, FEATURED_LIMIT);

  return (
    <div>
      <HomeHero photos={gallery} />
      <div className="mx-auto max-w-7xl space-y-10 px-3 py-8 sm:px-4 sm:py-10 md:space-y-12 md:px-6 md:py-14">
        <HomeContinueBrowse />
        <section>
          <h2 className="mb-4 font-heading text-2xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={ROUTES.category(category.slug)} className="group relative aspect-[5/4] overflow-hidden rounded-2xl bg-muted">
                <Image src={category.coverImage} alt={category.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 font-heading text-lg text-white">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
        <HomeRecentSections />
        {featuredCards.length ? (
          <section>
            <h2 className="mb-4 font-heading text-2xl">Featured</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {featuredCards.map((card) => (
                <ProductCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ) : null}
        {collections
          .filter((collection) => collection.isFeatured)
          .map((collection) => (
            <CollectionSection key={collection.id} collection={collection} />
          ))}
        <Suspense fallback={<ReelsStripSkeleton />}>
          <ReelsStrip tag="home" />
        </Suspense>
        <Suspense fallback={null}>
          <StoreBlock />
        </Suspense>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}
