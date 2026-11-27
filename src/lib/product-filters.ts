import { discountPercent } from "@/lib/format";
import type { CardVariant, ProductCardItem } from "@/types/catalogue";

export const PRODUCT_SORTS = ["recommended", "price_asc", "price_desc", "discount", "newest"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductFilters = {
  q: string;
  qualityIds: string[];
  brandIds: string[];
  sizeLabels: string[];
  colourIds: string[];
  collectionIds: string[];
  /** Spec label -> allowed values, e.g. { Comfort: ["Firm"] }. */
  specs: Record<string, string[]>;
  priceMax: number | null;
  discountMin: number | null;
  sort: ProductSort;
};

export const EMPTY_FILTERS: ProductFilters = {
  q: "", qualityIds: [], brandIds: [], sizeLabels: [], colourIds: [], collectionIds: [],
  specs: {}, priceMax: null, discountMin: null, sort: "recommended",
};

export type CardPrice = { price: number; mrp: number | null; discount: number };

function allows(selected: string[], value: string | null): boolean {
  return selected.length === 0 || (value !== null && selected.includes(value));
}

/** Variants that fit the chosen quality, size and colour. */
function getMatchingVariants(card: ProductCardItem, filters: ProductFilters): CardVariant[] {
  return card.variants.filter(
    (variant) =>
      allows(filters.qualityIds, variant.qualityId) &&
      allows(filters.sizeLabels, variant.sizeLabel) &&
      allows(filters.colourIds, variant.colourId),
  );
}

/** The "from" price: the cheapest matching variant. Null when none match. */
export function getCardPrice(card: ProductCardItem, filters: ProductFilters): CardPrice | null {
  const matching = getMatchingVariants(card, filters);
  if (!matching.length) return null;
  const cheapest = matching.reduce((best, variant) => (variant.price < best.price ? variant : best));
  const discount = Math.max(...matching.map((variant) => discountPercent(variant.mrp ?? 0, variant.price)));
  return { price: cheapest.price, mrp: cheapest.mrp, discount };
}

function matchesSpecs(card: ProductCardItem, specs: ProductFilters["specs"]): boolean {
  return Object.entries(specs).every(([label, values]) => allows(values, card.specs[label] ?? null));
}

function matchesCard(card: ProductCardItem, filters: ProductFilters, price: CardPrice | null): boolean {
  if (!price) return false;
  if (filters.q && !card.name.toLowerCase().includes(filters.q.toLowerCase())) return false;
  if (!allows(filters.brandIds, card.brandId)) return false;
  if (filters.collectionIds.length && !card.collectionIds.some((id) => filters.collectionIds.includes(id))) return false;
  if (!matchesSpecs(card, filters.specs)) return false;
  if (filters.priceMax !== null && price.price > filters.priceMax) return false;
  if (filters.discountMin !== null && price.discount < filters.discountMin) return false;
  return true;
}

type PricedCard = { card: ProductCardItem; price: CardPrice };

function compareCards(sort: ProductSort, a: PricedCard, b: PricedCard): number {
  if (sort === "price_asc") return a.price.price - b.price.price;
  if (sort === "price_desc") return b.price.price - a.price.price;
  if (sort === "discount") return b.price.discount - a.price.discount;
  if (sort === "newest") return b.card.createdAt.localeCompare(a.card.createdAt);
  return a.card.sortOrder - b.card.sortOrder;
}

/** Cards that pass every filter, with their price, in the chosen order. */
export function filterAndSortCards(cards: ProductCardItem[], filters: ProductFilters): PricedCard[] {
  const priced = cards.map((card) => ({ card, price: getCardPrice(card, filters) }));
  const kept = priced.filter((item): item is PricedCard => matchesCard(item.card, filters, item.price));
  return [...kept].sort((a, b) => compareCards(filters.sort, a, b));
}

export function countActiveFilters(filters: ProductFilters): number {
  const lists = [filters.qualityIds, filters.brandIds, filters.sizeLabels, filters.colourIds, filters.collectionIds];
  const specCount = Object.values(filters.specs).filter((values) => values.length).length;
  const single = [filters.q, filters.priceMax, filters.discountMin].filter(Boolean).length;
  return lists.filter((list) => list.length).length + specCount + single;
}
