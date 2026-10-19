import { Suspense } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { AdminStockGrid } from "@/components/admin/admin-stock-grid";
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

async function StockContent() {
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
      stockQty: v.stockQty,
      stockStatus: v.stockStatus,
    })),
  }));

  return <AdminStockGrid products={rows} />;
}

export default function StockPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock"
        description="Pick a product, then adjust quantities on its variants."
      />
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading stock…</p>
        }
      >
        <StockContent />
      </Suspense>
    </div>
  );
}
