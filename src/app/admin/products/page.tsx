import { PageHeader } from "@/components/admin/page-header";
import { AdminProductsTable } from "@/components/admin/admin-products-table";
import { getAllProducts, getCategories } from "@/services/catalogue";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories({ includeHidden: true }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Live catalogue — add drafts, archive, or delete."
      />
      <AdminProductsTable products={products} categories={categories} />
    </div>
  );
}
