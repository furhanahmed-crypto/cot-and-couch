import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CATEGORY_SLUGS } from "@/constants/categories";
import { CategoryPlp } from "@/components/shop/category-plp";
import { ReelsStrip } from "@/components/shop/reels-strip";
import {
  CategoryPageSkeleton,
  ReelsStripSkeleton,
} from "@/components/shop/shop-skeletons";
import {
  getMasters,
  getPublishedProductsByCategoryId,
  getShopCategoryBySlug,
} from "@/services/catalogue";

// Category slugs are fixed, so the build does not need the database.
export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((slug) => ({ slug }));
}

async function CategoryContent({ slug }: { slug: string }) {
  const category = await getShopCategoryBySlug(slug);
  if (!category) notFound();

  const [products, masters] = await Promise.all([
    getPublishedProductsByCategoryId(category.id),
    getMasters(),
  ]);

  return (
    <>
      <CategoryPlp
        category={category}
        products={products}
        colours={masters.colours}
        collections={masters.collections}
      />
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 md:px-6">
        <Suspense fallback={<ReelsStripSkeleton />}>
          <ReelsStrip tag={category.slug} />
        </Suspense>
      </div>
    </>
  );
}

async function CategoryFromParams({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryContent slug={slug} />;
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryFromParams params={params} />
    </Suspense>
  );
}
