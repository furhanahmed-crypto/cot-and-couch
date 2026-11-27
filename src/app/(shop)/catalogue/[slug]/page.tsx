import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryPlp } from "@/components/shop/category-plp";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { CategoryPageSkeleton, ReelsStripSkeleton } from "@/components/shop/shop-skeletons";
import { CATEGORY_SLUGS } from "@/constants/categories";
import { getCategoryBySlug, getCategoryFacets } from "@/services/catalogue/category-queries";
import { listProductCardsByCategory } from "@/services/catalogue/product-card-queries";
import { listCollections } from "@/services/collections/queries";

// Category slugs are fixed, so the build does not need the database.
export function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((slug) => ({ slug }));
}

async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [cards, facets, collections] = await Promise.all([
    listProductCardsByCategory(category.id),
    getCategoryFacets(category.id),
    listCollections(),
  ]);

  return (
    <>
      <CategoryPlp category={category} cards={cards} facets={facets} collections={collections} />
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 md:px-6">
        <Suspense fallback={<ReelsStripSkeleton />}>
          <ReelsStrip tag={category.slug} />
        </Suspense>
      </div>
    </>
  );
}

export default function CategoryPage({ params }: PageProps<"/catalogue/[slug]">) {
  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
