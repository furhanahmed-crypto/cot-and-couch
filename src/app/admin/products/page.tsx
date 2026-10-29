import { Suspense } from "react";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getBedRangesForAdmin } from "@/services/admin-categories";
import { getAdminCategories, getAllProducts } from "@/services/catalogue";
import { getCollections } from "@/services/ops";

export const instant = false;

async function ProductsContent() {
  const [products, categories, collections, bedRangeRows] = await Promise.all([
    getAllProducts(),
    getAdminCategories(),
    getCollections(),
    getBedRangesForAdmin(),
  ]);

  const liveProducts = products.filter((p) => {
    const cat = categories.find((c) => c.id === p.categoryId);
    return Boolean(cat?.visible);
  });

  const bedRanges = bedRangeRows
    .filter((r) => r.isActive)
    .map((r) => ({ id: r.id, name: r.name }));

  return (
    <AdminProductsTable
      products={liveProducts}
      categories={categories}
      collections={collections}
      bedRanges={bedRanges}
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
