import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { ProductEditorForm } from "@/components/admin/product-editor-form";
import { getAdminProductById, getCategories } from "@/services/catalogue";

export const instant = false;

async function ProductEditorContent({ id }: { id: string }) {
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories({ includeHidden: true }),
  ]);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);

  return (
    <>
      <PageHeader
        title={product.name}
        description={`Product editor · ${category?.name ?? "Category"} · ${product.status}`}
      />
      <ProductEditorForm product={product} category={category} />
    </>
  );
}

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading product…</p>
        }
      >
        <ProductEditorContent id={id} />
      </Suspense>
    </div>
  );
}
