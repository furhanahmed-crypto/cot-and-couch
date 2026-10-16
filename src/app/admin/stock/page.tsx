import { PageHeader } from "@/components/admin/page-header";
import { AdminStockGrid } from "@/components/admin/admin-stock-grid";
import { getAllProducts } from "@/services/catalogue";

export default async function StockPage() {
  const products = await getAllProducts();
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productName: p.name,
      sku: v.sku,
      variantId: v.id,
      stockQty: v.stockQty,
      stockStatus: v.stockStatus,
    })),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock"
        description="Variant quantities write to product_variants in Neon."
      />
      <AdminStockGrid initial={rows} />
    </div>
  );
}
