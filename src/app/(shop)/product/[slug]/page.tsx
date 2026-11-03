import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PdpCtaBar } from "@/components/shop/pdp-cta-bar";
import { PdpMain } from "@/components/shop/pdp-main";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { ProductViewTracker } from "@/components/shop/product-view-tracker";
import {
  ProductPageSkeleton,
  ReelsStripSkeleton,
} from "@/components/shop/shop-skeletons";
import { ROUTES } from "@/constants/routes";
import { displayProductName } from "@/lib/catalogue-utils";
import { getMasters, getProductBySlug, getProductsByIds } from "@/services/catalogue";
import { listBedCategoryAddons } from "@/services/bed-addons";
import { getStoreInfo } from "@/services/ops";

async function ProductContent({
  slug,
  rangeSlug,
}: {
  slug: string;
  rangeSlug?: string;
}) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const isBed = Boolean(
    product.bedRangeIds?.length || product.bedRangeId || product.availableRanges?.length,
  );

  const [related, completeRoom, masters, storeInfo, bedAddonRows] =
    await Promise.all([
      getProductsByIds(product.relatedIds),
      getProductsByIds(product.completeRoomIds),
      getMasters(),
      getStoreInfo(),
      isBed ? listBedCategoryAddons() : Promise.resolve([]),
    ]);
  const activeRange =
    product.availableRanges?.find((r) => r.slug === rangeSlug) ??
    product.availableRanges?.[0];
  const shopName = displayProductName(
    product.name,
    activeRange?.name ?? product.bedRangeName,
  );
  const productUrl = ROUTES.product(product.slug, activeRange?.slug);

  return (
    <div className="pb-28">
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <PdpMain
          product={product}
          initialRangeSlug={rangeSlug}
          colours={masters.colours}
          sizes={masters.sizes}
          bedAddonRows={bedAddonRows.map((r) => ({
            id: r.id,
            key: r.key,
            label: r.label,
            sortOrder: r.sortOrder,
          }))}
        />

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
          <Suspense fallback={<ReelsStripSkeleton />}>
            <ReelsStrip tag={product.slug} />
          </Suspense>
        </div>
      </div>

      <PdpCtaBar
        productName={shopName}
        productUrl={productUrl}
        storeInfo={storeInfo}
      />
    </div>
  );
}

async function ProductFromParams({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const [{ slug }, { range }] = await Promise.all([params, searchParams]);
  return <ProductContent slug={slug} rangeSlug={range} />;
}

export default function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductFromParams params={params} searchParams={searchParams} />
    </Suspense>
  );
}
