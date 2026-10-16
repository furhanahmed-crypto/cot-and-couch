import { notFound } from "next/navigation";
import { CategoryPlp } from "@/components/shop/category-plp";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { attributeTemplates } from "@/data/mock/categories";
import {
  getCategoryBySlug,
  getMasters,
  getPublishedProducts,
} from "@/services/catalogue";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [products, masters] = await Promise.all([
    getPublishedProducts(),
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
        <ReelsStrip tag={category.slug} />
      </div>
    </>
  );
}
