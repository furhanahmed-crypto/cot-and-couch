"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HomeHero } from "@/components/shop/home-hero";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { StoreBlock } from "@/components/shop/store-block";
import { ROUTES, STORAGE_KEYS } from "@/constants/routes";
import { useIsClient } from "@/hooks/use-is-client";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import {
  getCategories,
  getFeaturedProducts,
  getProductsByIds,
  getRoyalRangeProducts,
} from "@/services/catalogue";
import { getCachedJson, subscribeKey } from "@/services/storage";

type LastBrowse = { path?: string } | null;

export default function HomePage() {
  const cats = getCategories();
  const featured = getFeaturedProducts().slice(0, 8);
  const royal = getRoyalRangeProducts().slice(0, 6);
  const { ids: recentIds } = useRecentlyViewed();
  const recent = getProductsByIds(recentIds).slice(0, 8);
  const inspired = getProductsByIds(
    recentIds.length
      ? featured.filter((p) => !recentIds.includes(p.id)).map((p) => p.id)
      : featured.map((p) => p.id),
  ).slice(0, 4);

  const ready = useIsClient();
  const lastBrowse = useSyncExternalStore(
    (onChange) => subscribeKey(STORAGE_KEYS.lastBrowse, onChange),
    () => getCachedJson<LastBrowse>(STORAGE_KEYS.lastBrowse, null),
    () => null,
  );
  const continuePath = ready ? lastBrowse?.path ?? null : null;

  return (
    <div>
      <HomeHero />
      <div className="mx-auto max-w-7xl space-y-10 px-3 py-8 sm:px-4 sm:py-10 md:space-y-12 md:px-6 md:py-14">
        {continuePath && (
          <div className="rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm">
            Continue where you left off —{" "}
            <Link href={continuePath} className="font-medium text-primary underline-offset-2 hover:underline">
              resume browsing
            </Link>
          </div>
        )}

        <section>
          <h2 className="font-heading mb-4 text-2xl">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={ROUTES.category(c.slug)}
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

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-heading text-2xl">Featured & new</h2>
            <Link href={ROUTES.catalogue} className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brass">Signature</p>
              <h2 className="font-heading text-2xl">Royal Range</h2>
            </div>
            <Link
              href={ROUTES.collection("royal-range")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Explore
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {royal.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {inspired.length > 0 && (
          <section>
            <h2 className="font-heading mb-4 text-2xl">Inspired by your browsing</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {inspired.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        <ReelsStrip tag="home" />
        <StoreBlock />
      </div>
    </div>
  );
}
