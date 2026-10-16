/**
 * Pure catalogue helpers shared by server and client components.
 * Must stay free of DB / server-only imports so client bundles stay small.
 */
import { discountPercent } from "@/lib/format";
import type { Colour, Product, StockStatus } from "@/types";

export type SortKey =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "newest"
  | "discount";

export interface FilterState {
  subCategory?: string;
  priceMin?: number;
  priceMax?: number;
  discountMin?: number;
  colours?: string[];
  materials?: string[];
  collections?: string[];
  availability?: StockStatus[];
  extra?: Record<string, string[]>;
  q?: string;
}

export function startingPrice(product: Product) {
  const prices = product.variants.map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function maxDiscount(product: Product) {
  if (!product.variants.length) return 0;
  return Math.max(
    ...product.variants.map((v) => discountPercent(v.mrp, v.price)),
  );
}

export function productColours(product: Product): Colour[] {
  const map = new Map<string, Colour>();
  for (const v of product.variants) {
    if (!v.colourId || map.has(v.colourId)) continue;
    map.set(v.colourId, {
      id: v.colourId,
      name: v.colourName ?? "Colour",
      hex: v.colourHex ?? "#CCCCCC",
    });
  }
  return [...map.values()];
}

export function worstStock(product: Product): StockStatus {
  const order: StockStatus[] = [
    "out_of_stock",
    "low_stock",
    "made_to_order",
    "in_stock",
  ];
  for (const s of order) {
    if (product.variants.some((v) => v.stockStatus === s)) return s;
  }
  return "in_stock";
}

export function filterProductList(
  list: Product[],
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortKey,
  categoryNames: Map<string, string> = new Map(),
): Product[] {
  let result = list;
  if (categoryId) result = result.filter((p) => p.categoryId === categoryId);

  if (filters.subCategory) {
    result = result.filter((p) => p.subCategoryId === filters.subCategory);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter((p) => {
      const cat = categoryNames.get(p.categoryId) ?? "";
      const cols = productColours(p)
        .map((c) => c.name)
        .join(" ")
        .toLowerCase();
      return [p.name, cat, p.material, cols, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    result = result.filter((p) => {
      const price = startingPrice(p);
      if (filters.priceMin != null && price < filters.priceMin) return false;
      if (filters.priceMax != null && price > filters.priceMax) return false;
      return true;
    });
  }
  if (filters.discountMin) {
    result = result.filter((p) => maxDiscount(p) >= filters.discountMin!);
  }
  if (filters.colours?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.colours!.includes(v.colourId)),
    );
  }
  if (filters.materials?.length) {
    result = result.filter((p) =>
      filters.materials!.some((m) =>
        p.material.toLowerCase().includes(m.toLowerCase()),
      ),
    );
  }
  if (filters.collections?.length) {
    result = result.filter(
      (p) => p.collectionId && filters.collections!.includes(p.collectionId),
    );
  }
  if (filters.availability?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.availability!.includes(v.stockStatus)),
    );
  }
  if (filters.extra) {
    for (const [key, values] of Object.entries(filters.extra)) {
      if (!values.length) continue;
      result = result.filter((p) =>
        values.includes(String(p.specs[key] ?? "")),
      );
    }
  }

  const sorted = [...result];
  sorted.sort((a, b) => {
    if (sort === "price_asc") return startingPrice(a) - startingPrice(b);
    if (sort === "price_desc") return startingPrice(b) - startingPrice(a);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "discount") return maxDiscount(b) - maxDiscount(a);
    return b.popularity - a.popularity;
  });
  return sorted;
}
