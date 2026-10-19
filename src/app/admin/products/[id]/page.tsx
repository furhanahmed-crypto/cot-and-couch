import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getAdminProductById, getCategories } from "@/services/catalogue";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories({ includeHidden: true }),
  ]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`Product editor · ${category?.name ?? "Category"} · ${product.status}`}
      />
      <ProductEditorForm product={product} category={category} />
    </div>
  );
}
