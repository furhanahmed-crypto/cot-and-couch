import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { HomeHero } from "@/components/shop/home-hero";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { StoreBlock } from "@/components/shop/store-block";
import { HomeContinueBrowse } from "@/components/shop/home-continue-browse";
import { HomeRecentSections } from "@/components/shop/home-recent-sections";
import {
  HomePageSkeleton,
  ReelsStripSkeleton,
} from "@/components/shop/shop-skeletons";
import { ROUTES } from "@/constants/routes";
import { SHOP_CACHE_TAG } from "@/lib/cache-tags";
import {
  getShopCategories,
  getFeaturedProducts,
  getProductsByIds,
  getRoyalRangeProducts,
} from "@/services/catalogue";
import { getGallery } from "@/services/ops";

async function HomeContent() {
  "use cache";
  cacheLife("hours");
  cacheTag(SHOP_CACHE_TAG);
  const [cats, featured, royal, gallery] = await Promise.all([
    getShopCategories(),
    getFeaturedProducts(),
    getRoyalRangeProducts(),
    getGallery(),
  ]);
  const heroIds = [
    ...new Set(gallery.map((item) => item.productId).filter(Boolean)),
  ];
  const heroProducts = await getProductsByIds(heroIds);
  const featuredSlice = featured.slice(0, 8);
  const royalSlice = royal.slice(0, 6);

  return (
    <div>
      <HomeHero products={heroProducts} gallery={gallery} />
      <div className="mx-auto max-w-7xl space-y-10 px-3 py-8 sm:px-4 sm:py-10 md:space-y-12 md:px-6 md:py-14">
        <HomeContinueBrowse />

        <section>
          <h2 className="font-heading mb-4 text-2xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={ROUTES.category(c.slug)}
                prefetch
                className="group relative aspect-[5/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={c.coverImage}
                  alt={c.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute bottom-3 left-3 font-heading text-lg text-white">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <HomeRecentSections featured={featuredSlice} />

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl">Featured & new</h2>
            <Link
              href={ROUTES.catalogue}
              prefetch
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featuredSlice.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brass">
                Signature
              </p>
              <h2 className="font-heading text-2xl">Royal Range</h2>
            </div>
            <Link
              href={ROUTES.collection("royal-range")}
              prefetch
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Explore
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {royalSlice.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

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
