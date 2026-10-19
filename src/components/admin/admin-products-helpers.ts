import type { Product } from "@/types";

const SPEC_TOTAL = 12;

/** Spec completeness against the Figma-style 12-field checklist. */
export function specCompleteness(product: Product): {
  filled: number;
  total: number;
} {
  const checks = [
    Boolean(product.name?.trim()),
    Boolean(product.description?.trim()) && product.description !== product.name,
    product.highlights.length > 0,
    Boolean(product.material?.trim()),
    Boolean(product.finish?.trim()),
    product.warrantyYears > 0,
    Boolean(product.care?.trim()),
    Boolean(product.deliveryDays?.trim()),
    product.variants.length > 0,
    product.variants.some((v) => v.images.length > 0),
    product.variants.some((v) => v.price > 0),
    Object.keys(product.specs ?? {}).length > 0 || product.tags.length > 0,
  ];
  return {
    filled: checks.filter(Boolean).length,
    total: SPEC_TOTAL,
  };
}

export function optionsSummary(product: Product): string {
  const sizes = unique(
    product.variants
      .map((v) => v.sizeDimensionLabel || v.sizeGroupLabel)
      .filter(Boolean) as string[],
  );
  const colours = unique(
    product.variants.map((v) => v.colourName).filter(Boolean) as string[],
  );
  const thicknesses = unique(
    product.variants.map((v) => v.thicknessLabel).filter(Boolean) as string[],
  );

  const parts: string[] = [];
  if (sizes.length) {
    parts.push(sizes.length > 4 ? `${sizes.length} sizes` : sizes.join(", "));
  }
  if (thicknesses.length) {
    parts.push(
      thicknesses.length > 4
        ? `${thicknesses.length} thicknesses`
        : thicknesses.join(", "),
    );
  }
  if (colours.length) {
    parts.push(colours.length > 4 ? `${colours.length} colours` : colours.join(", "));
  }
  return parts.join(" · ");
}

export function productSkuPrefix(product: Product): string {
  const sku = product.variants[0]?.sku ?? "";
  if (!sku) return "";
  const parts = sku.split(/[-_]/);
  if (parts.length >= 2) return parts.slice(0, 2).join("-").toUpperCase();
  return sku.slice(0, 10).toUpperCase();
}

export function stockSummary(product: Product): {
  kind: "in_stock" | "low" | "made_to_order" | "out";
  label: string;
  qty: number;
} {
  const variants = product.variants;
  if (!variants.length) return { kind: "out", label: "Out of stock", qty: 0 };

  const allMto = variants.every(
    (v) => v.stockStatus === "made_to_order" || v.isCustomSize,
  );
  if (allMto) return { kind: "made_to_order", label: "Made to order", qty: 0 };

  const qty = variants.reduce((s, v) => s + Math.max(0, v.stockQty), 0);
  if (qty <= 0) return { kind: "out", label: "Out of stock", qty: 0 };
  if (qty <= 2) return { kind: "low", label: `${qty} left`, qty };
  return { kind: "in_stock", label: `${qty} in stock`, qty };
}

function unique(items: string[]) {
  return [...new Set(items.map((s) => s.trim()).filter(Boolean))];
}
