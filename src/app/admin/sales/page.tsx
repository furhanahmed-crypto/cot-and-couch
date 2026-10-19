import { PageHeader } from "@/components/admin/page-header";
import {
  SalesManager,
  type SaleProductOption,
} from "@/components/admin/sales-manager";
import { getAllProducts } from "@/services/catalogue";
import { getOrders } from "@/services/ops";

export const instant = false;

export default async function SalesPage() {
  const [sales, products] = await Promise.all([
    getOrders(),
    getAllProducts(),
  ]);

  const productOptions: SaleProductOption[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    variants: p.variants.map((v) => ({
      id: v.id,
      label: [
        v.sku,
        v.sizeDimensionLabel || v.sizeGroupLabel,
        v.thicknessLabel,
        v.colourName,
      ]
        .filter(Boolean)
        .join(" · "),
    })),
  }));

  const productNames = Object.fromEntries(products.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & delivery"
        description="Record showroom sales and move orders from confirmed → on the way → delivered."
      />
      <SalesManager
        orders={sales}
        products={productOptions}
        productNames={productNames}
      />
    </div>
  );
}
