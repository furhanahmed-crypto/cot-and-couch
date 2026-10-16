import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { AdminPricingGrid } from "@/components/admin/admin-pricing-grid";
import { getAllProducts } from "@/services/catalogue";

export default async function PricingPage() {
  const products = await getAllProducts();
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productName: p.name,
      sku: v.sku,
      variantId: v.id,
      mrp: v.mrp,
      price: v.price,
      maxDiscountPercent: v.maxDiscountPercent,
    })),
  );

  return (
    <AdminGate title="Pricing">
      <div className="space-y-6">
        <PageHeader
          title="Pricing"
          description="Offer prices write to product_variants in Neon."
        />
        <AdminPricingGrid initial={rows} />
      </div>
    </AdminGate>
  );
}
