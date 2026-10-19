import { Suspense } from "react";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getAllProducts, getCategories } from "@/services/catalogue";
import { getCollections } from "@/services/ops";

export const instant = false;

async function ProductsContent() {
  const [products, categories, collections] = await Promise.all([
    getAllProducts(),
    getCategories({ includeHidden: true }),
    getCollections(),
  ]);

  return (
    <AdminProductsTable
      products={products}
      categories={categories}
      collections={collections}
    />
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted-foreground">Loading products…</p>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
