import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopHeaderSkeleton } from "@/components/shop/shop-skeletons";
import { ShopStoresBoot } from "@/components/shop/shop-stores-boot";
import { BrandMark } from "@/components/shared/brand-mark";
import { SHOP_CACHE_TAG } from "@/lib/cache-tags";
import { getShopCategories } from "@/services/catalogue";

async function ShopHeaderSlot() {
  "use cache";
  cacheLife("hours");
  cacheTag(SHOP_CACHE_TAG);
  const categories = await getShopCategories();
  return <ShopHeader categories={categories} />;
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ShopStoresBoot />
      <Suspense fallback={<ShopHeaderSkeleton />}>
        <ShopHeaderSlot />
      </Suspense>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/70 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-3 text-center sm:px-4">
          <BrandMark href="/" compact />
          <p className="text-xs text-muted-foreground">
            Lingampally · Showroom catalogue
          </p>
        </div>
      </footer>
    </>
  );
}
