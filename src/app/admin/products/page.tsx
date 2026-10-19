import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getAllProducts, getCategories } from "@/services/catalogue";

export const instant = false;

async function ProductsContent() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories({ includeHidden: true }),
  ]);

  return <AdminProductsTable products={products} categories={categories} />;
}

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Catalogue list — create drafts, edit by category template, archive or delete."
      />
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading products…</p>
        }
      >
        <ProductsContent />
      </Suspense>
    </div>
  );
}
