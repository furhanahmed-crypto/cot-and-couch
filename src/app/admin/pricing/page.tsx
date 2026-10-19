import { Suspense } from "react";
import { AdminGate } from "@/components/admin/admin-gate";
import { PageHeader } from "@/components/admin/page-header";
import { AdminPricingGrid } from "@/components/admin/admin-pricing-grid";
import { getAllProducts, getCategories } from "@/services/catalogue";

export const instant = false;

function variantLabel(v: {
  sizeGroupLabel: string;
  sizeDimensionLabel: string | null;
  thicknessLabel: string | null;
  colourName?: string;
  isCustomSize: boolean;
}) {
  return [
    v.isCustomSize
      ? "Custom"
      : [v.sizeGroupLabel, v.sizeDimensionLabel].filter(Boolean).join(" "),
    v.thicknessLabel?.replace(/inch/i, "in"),
    v.colourName,
  ]
    .filter(Boolean)
    .join(" · ");
}

async function PricingContent() {
  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories({ includeHidden: true }),
  ]);
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: catName.get(p.categoryId) ?? "Catalogue",
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: variantLabel(v),
      mrp: v.mrp,
      price: v.price,
    })),
  }));

  return <AdminPricingGrid products={rows} />;
}

export default function PricingPage() {
  return (
    <AdminGate title="Pricing">
      <div className="space-y-6">
        <PageHeader
          title="Pricing"
          description="Pick a product, then edit offer prices on its variants — same model as the product editor."
        />
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">Loading pricing…</p>
          }
        >
          <PricingContent />
        </Suspense>
      </div>
    </AdminGate>
  );
}
