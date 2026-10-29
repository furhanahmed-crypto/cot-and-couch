import { PageHeader } from "@/components/admin/page-header";
import {
  OrdersManager,
  type OrderProductOption,
} from "@/components/admin/orders-manager";
import { getAllProducts } from "@/services/catalogue";
import { getOrders } from "@/services/ops";

export const instant = false;

export default async function OrdersPage() {
  const [orders, products] = await Promise.all([
    getOrders(),
    getAllProducts(),
  ]);

  const productOptions: OrderProductOption[] = products.map((p) => ({
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
        title="Orders"
        description="Record showroom orders and update delivery status."
      />
      <OrdersManager
        orders={orders}
        products={productOptions}
        productNames={productNames}
      />
    </div>
  );
}
