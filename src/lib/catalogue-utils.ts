/**
 * Pure catalogue helpers shared by server and client components.
 * Must stay free of DB / server-only imports so client bundles stay small.
 */
import {
  BED_RANGE_PRICING,
  bedSheetPricesForWidth,
} from "@/constants/bed-pricing";
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
  /** Bed range master ids */
  bedRanges?: string[];
  /** Bed width labels from variants */
  widths?: string[];
  /** Mattress / other attribute labels keyed by field (purpose, comfort, …) */
  attrs?: Record<string, string[]>;
  q?: string;
}

/** Sheet “from” / MRP / max % for a range — uses matrix, not stored Ideal SKUs. */
function sheetPriceStats(rangeSlug: string) {
  const row = BED_RANGE_PRICING[rangeSlug];
  if (!row) return null;
  const prices = Object.values(row.price).filter(
    (n): n is number => typeof n === "number",
  );
  const mrps = Object.values(row.mrp).filter(
    (n): n is number => typeof n === "number",
  );
  if (!prices.length || !mrps.length) return null;
  let maxOff = 0;
  for (const key of Object.keys(row.price) as (keyof typeof row.price)[]) {
    const p = row.price[key];
    const m = row.mrp[key];
    if (p == null || m == null) continue;
    maxOff = Math.max(maxOff, discountPercent(m, p));
  }
  return {
    fromPrice: Math.min(...prices),
    fromMrp: Math.min(...mrps),
    maxOff,
  };
}

/** Shop display: "Classic - Ideal Range" when a range is known. */
export function displayProductName(
  name: string,
  rangeName?: string | null,
) {
  const range = rangeName?.trim();
  if (!range) return name;
  const suffix = ` - ${range}`;
  if (name.endsWith(suffix) || name.endsWith(` - ${range}`)) return name;
  return `${name}${suffix}`;
}

export function startingPrice(product: Product, rangeId?: string) {
  if (rangeId) {
    const pool = product.variants.filter((v) => v.bedRangeId === rangeId);
    if (pool.length) return Math.min(...pool.map((v) => v.price));
    const range = product.availableRanges?.find((r) => r.id === rangeId);
    if (range) {
      const stats = sheetPriceStats(range.slug);
      if (stats) return stats.fromPrice;
    }
  }
  const prices = product.variants.map((v) => v.price);
  return prices.length ? Math.min(...prices) : 0;
}

export function startingMrp(product: Product, rangeId?: string) {
  if (rangeId) {
    const pool = product.variants.filter((v) => v.bedRangeId === rangeId);
    if (pool.length) return Math.min(...pool.map((v) => v.mrp));
    const range = product.availableRanges?.find((r) => r.id === rangeId);
    if (range) {
      const stats = sheetPriceStats(range.slug);
      if (stats) return stats.fromMrp;
    }
  }
  const mrps = product.variants.map((v) => v.mrp);
  return mrps.length ? Math.min(...mrps) : 0;
}

export function maxDiscount(product: Product, rangeId?: string) {
  if (rangeId) {
    const pool = product.variants.filter((v) => v.bedRangeId === rangeId);
    if (pool.length) {
      return Math.max(
        0,
        ...pool.map((v) => discountPercent(v.mrp, v.price)),
      );
    }
    const range = product.availableRanges?.find((r) => r.id === rangeId);
    if (range) {
      const stats = sheetPriceStats(range.slug);
      if (stats) return stats.maxOff;
    }
  }
  if (!product.variants.length) return 0;
  return Math.max(
    ...product.variants.map((v) => discountPercent(v.mrp, v.price)),
  );
}

/** Price / discount fit for a PLP card (product × optional range). */
export function cardMatchesPriceDiscount(
  product: Product,
  filters: Pick<FilterState, "priceMin" | "priceMax" | "discountMin">,
  rangeId?: string,
) {
  const price = startingPrice(product, rangeId);
  if (filters.priceMin != null && price < filters.priceMin) return false;
  if (filters.priceMax != null && price > filters.priceMax) return false;
  if (
    filters.discountMin != null &&
    maxDiscount(product, rangeId) < filters.discountMin
  ) {
    return false;
  }
  return true;
}

function linkedRangeIds(product: Product, filterRangeIds?: string[]) {
  const all = product.availableRanges?.length
    ? product.availableRanges.map((r) => r.id)
    : product.bedRangeId
      ? [product.bedRangeId]
      : [];
  if (!filterRangeIds?.length) return all;
  return all.filter((id) => filterRangeIds.includes(id));
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

export function productWidthLabels(product: Product): string[] {
  const set = new Set<string>();
  for (const v of product.variants) {
    if (v.sizeGroupLabel) set.add(v.sizeGroupLabel);
  }
  return [...set];
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
      const ranges = (p.availableRanges ?? [])
        .map((r) => r.name)
        .join(" ")
        .toLowerCase();
      const range = (p.bedRangeName ?? "").toLowerCase();
      return [p.name, cat, p.material, cols, range, ranges, ...p.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }
  if (
    filters.priceMin != null ||
    filters.priceMax != null ||
    filters.discountMin != null
  ) {
    result = result.filter((p) => {
      const rangeIds = linkedRangeIds(p, filters.bedRanges);
      if (rangeIds.length) {
        // Keep product if any linked (and selected) range card would pass.
        return rangeIds.some((id) =>
          cardMatchesPriceDiscount(p, filters, id),
        );
      }
      return cardMatchesPriceDiscount(p, filters);
    });
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
  if (filters.bedRanges?.length) {
    result = result.filter((p) => {
      const ids = p.bedRangeIds?.length
        ? p.bedRangeIds
        : p.bedRangeId
          ? [p.bedRangeId]
          : [];
      return ids.some((id) => filters.bedRanges!.includes(id));
    });
  }
  if (filters.widths?.length) {
    result = result.filter((p) =>
      p.variants.some((v) => filters.widths!.includes(v.sizeGroupLabel)),
    );
  }
  if (filters.attrs) {
    for (const [key, values] of Object.entries(filters.attrs)) {
      if (!values.length) continue;
      result = result.filter((p) =>
        values.includes(String(p.specs[key] ?? "")),
      );
    }
  }

  const sorted = [...result];
  sorted.sort((a, b) => {
    // Prefer cheapest / highest-discount among ranges that will appear as cards.
    const priceOf = (p: Product) => {
      const ids = linkedRangeIds(p, filters.bedRanges);
      if (!ids.length) return startingPrice(p);
      return Math.min(...ids.map((id) => startingPrice(p, id)));
    };
    const discountOf = (p: Product) => {
      const ids = linkedRangeIds(p, filters.bedRanges);
      if (!ids.length) return maxDiscount(p);
      return Math.max(...ids.map((id) => maxDiscount(p, id)));
    };
    if (sort === "price_asc") return priceOf(a) - priceOf(b);
    if (sort === "price_desc") return priceOf(b) - priceOf(a);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "discount") return discountOf(b) - discountOf(a);
    return b.popularity - a.popularity;
  });
  return sorted;
}
