import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryPlp } from "@/components/shop/category-plp";
import { ReelsStrip } from "@/components/shop/reels-strip";
import {
  CategoryPageSkeleton,
  ReelsStripSkeleton,
} from "@/components/shop/shop-skeletons";
import { attributeTemplates } from "@/data/mock/categories";
import {
  getCategories,
  getMasters,
  getPublishedProductsByCategoryId,
  getShopCategoryBySlug,
} from "@/services/catalogue";

export async function generateStaticParams() {
  try {
    const cats = await getCategories();
    return cats.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

async function CategoryContent({ slug }: { slug: string }) {
  const category = await getShopCategoryBySlug(slug);
  if (!category) notFound();

  const [products, masters] = await Promise.all([
    getPublishedProductsByCategoryId(category.id),
    getMasters(),
  ]);
  const template = attributeTemplates.find((t) => t.id === category.templateId);

  return (
    <>
      <CategoryPlp
        category={category}
        products={products}
        colours={masters.colours}
        collections={masters.collections}
        extraFields={template?.fields}
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
