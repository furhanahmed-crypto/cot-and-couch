import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { CatalogueIndexSkeleton } from "@/components/shop/shop-skeletons";
import { ROUTES } from "@/constants/routes";
import { SHOP_CACHE_TAG } from "@/lib/cache-tags";
import { getCategories } from "@/services/catalogue";

async function CatalogueIndexContent() {
  "use cache";
  cacheLife("hours");
  cacheTag(SHOP_CACHE_TAG);
  const cats = await getCategories();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="font-heading mb-6 text-3xl">Catalogue</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cats.map((c) => (
          <Link
            key={c.id}
            href={ROUTES.category(c.slug)}
            prefetch
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
          >
            <Image
              src={c.coverImage}
              alt={c.name}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute bottom-4 left-4 font-heading text-xl text-white">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CatalogueIndexPage() {
  return (
    <Suspense fallback={<CatalogueIndexSkeleton />}>
      <CatalogueIndexContent />
    </Suspense>
  );
}
