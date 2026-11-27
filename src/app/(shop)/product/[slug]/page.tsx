import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PdpCtaBar } from "@/components/shop/pdp-cta-bar";
import { PdpDetails } from "@/components/shop/pdp-details";
import { PdpMain } from "@/components/shop/pdp-main";
import { ProductViewTracker } from "@/components/shop/product-view-tracker";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { ProductPageSkeleton, ReelsStripSkeleton } from "@/components/shop/shop-skeletons";
import { ROUTES } from "@/constants/routes";
import { getProductDetailBySlug } from "@/services/catalogue/product-detail-queries";
import { getStoreInfo } from "@/services/settings/queries";

type ProductContentProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ quality?: string | string[] }>;
};

async function ProductContent({ params, searchParams }: ProductContentProps) {
  const [{ slug }, { quality }] = await Promise.all([params, searchParams]);
  const [product, storeInfo] = await Promise.all([getProductDetailBySlug(slug), getStoreInfo()]);
  if (!product) notFound();
  const initialQualityId = typeof quality === "string" ? quality : undefined;

  return (
    <div className="pb-28">
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <PdpMain product={product} initialQualityId={initialQualityId} />
        <PdpDetails product={product} />
        <div className="mt-12">
          <Suspense fallback={<ReelsStripSkeleton />}>
            <ReelsStrip tag={product.slug} />
          </Suspense>
        </div>
      </div>
      <PdpCtaBar productId={product.id} productName={product.name} productUrl={ROUTES.product(product.slug)} storeInfo={storeInfo} />
    </div>
  );
}

export default function ProductPage({ params, searchParams }: PageProps<"/product/[slug]">) {
  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
