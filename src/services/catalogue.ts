import {
  brands,
  categories,
  collections,
  colours,
  products,
  sizes,
  storeInfo,
} from "@/data/mock";
import type { Product, StockStatus } from "@/types";
import { discountPercent } from "@/lib/format";

export function getCategories() {
  return [...categories].filter((c) => c.visible).sort((a, b) => a.order - b.order);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug && p.status === "published");
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getPublishedProducts() {
  return products.filter((p) => p.status === "published");
}

export function getFeaturedProducts() {
  return getPublishedProducts()
    .filter((p) => p.featured)
    .sort((a, b) => b.popularity - a.popularity);
}

export function getRoyalRangeProducts() {
  return getPublishedProducts().filter((p) => p.collectionId === "col-royal");
}

export function getProductsByIds(ids: string[]) {
  return ids.map((id) => getProductById(id)).filter(Boolean) as Product[];
}

export function startingPrice(product: Product) {
  const prices = product.variants.map((v) => v.price);
  return Math.min(...prices);
}

export function maxDiscount(product: Product) {
  return Math.max(...product.variants.map((v) => discountPercent(v.mrp, v.price)));
}

export function productColours(product: Product) {
  const ids = [...new Set(product.variants.map((v) => v.colourId))];
  return ids.map((id) => colours.find((c) => c.id === id)!).filter(Boolean);
}

export function worstStock(product: Product): StockStatus {
  const order: StockStatus[] = ["out_of_stock", "low_stock", "made_to_order", "in_stock"];
  for (const s of order) {
    if (product.variants.some((v) => v.stockStatus === s)) return s;
  }
  return "in_stock";
}

export type SortKey = "popularity" | "price_asc" | "price_desc" | "newest" | "discount";

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

export function filterProducts(
  categoryId: string | undefined,
  filters: FilterState,
  sort: SortKey,
): Product[] {
  let list = getPublishedProducts();
  if (categoryId) list = list.filter((p) => p.categoryId === categoryId);

  if (filters.subCategory) {
    list = list.filter((p) => p.subCategoryId === filters.subCategory);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      const col = collections.find((c) => c.id === p.collectionId)?.name ?? "";
      const mats = p.material.toLowerCase();
      const cols = productColours(p)
        .map((c) => c.name)
        .join(" ")
        .toLowerCase();
      return [p.name, cat, col, mats, cols, ...p.tags].join(" ").toLowerCase().includes(q);
    });
  }
  if (filters.priceMin != null || filters.priceMax != null) {
    list = list.filter((p) => {
      const price = startingPrice(p);
      if (filters.priceMin != null && price < filters.priceMin) return false;
      if (filters.priceMax != null && price > filters.priceMax) return false;
      return true;
    });
  }
  if (filters.discountMin) {
    list = list.filter((p) => maxDiscount(p) >= filters.discountMin!);
  }
  if (filters.colours?.length) {
    list = list.filter((p) =>
      p.variants.some((v) => filters.colours!.includes(v.colourId)),
    );
  }
  if (filters.materials?.length) {
    list = list.filter((p) =>
      filters.materials!.some((m) => p.material.toLowerCase().includes(m.toLowerCase())),
    );
  }
  if (filters.collections?.length) {
    list = list.filter((p) => filters.collections!.includes(p.collectionId));
  }
  if (filters.availability?.length) {
    list = list.filter((p) =>
      p.variants.some((v) => filters.availability!.includes(v.stockStatus)),
    );
  }
  if (filters.extra) {
    for (const [key, values] of Object.entries(filters.extra)) {
      if (!values.length) continue;
      list = list.filter((p) => values.includes(String(p.specs[key] ?? "")));
    }
  }

  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sort === "price_asc") return startingPrice(a) - startingPrice(b);
    if (sort === "price_desc") return startingPrice(b) - startingPrice(a);
    if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "discount") return maxDiscount(b) - maxDiscount(a);
    return b.popularity - a.popularity;
  });
  return sorted;
}

export function searchProducts(q: string) {
  return filterProducts(undefined, { q }, "popularity");
}

export function getMasters() {
  return { colours, brands, collections, sizes, storeInfo };
}

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug);
}
