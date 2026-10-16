import { notFound } from "next/navigation";
import { PdpCtaBar } from "@/components/shop/pdp-cta-bar";
import { PdpMain } from "@/components/shop/pdp-main";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { ProductViewTracker } from "@/components/shop/product-view-tracker";
import { ROUTES } from "@/constants/routes";
import { getMasters, getProductBySlug, getProductsByIds } from "@/services/catalogue";
import { getStoreInfo } from "@/services/ops";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, completeRoom, masters, storeInfo] = await Promise.all([
    getProductsByIds(product.relatedIds),
    getProductsByIds(product.completeRoomIds),
    getMasters(),
    getStoreInfo(),
  ]);
  const productUrl = ROUTES.product(product.slug);

  return (
    <div className="pb-28">
      <ProductViewTracker productId={product.id} />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <PdpMain
          product={product}
          colours={masters.colours}
          sizes={masters.sizes}
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
          <ReelsStrip tag={product.slug} />
        </div>
      </div>

      <PdpCtaBar
        productName={product.name}
        productUrl={productUrl}
        storeInfo={storeInfo}
      />
    </div>
  );
}
