import { EMPTY_FILTERS, PRODUCT_SORTS, type ProductFilters, type ProductSort } from "@/lib/product-filters";

// URL keys. Lists are comma-separated; specs use "spec.<Label>".
const LIST_KEYS = {
  qualityIds: "quality",
  brandIds: "brand",
  sizeLabels: "size",
  colourIds: "colour",
  collectionIds: "collection",
} as const;
const SPEC_PREFIX = "spec.";

type Params = { get(key: string): string | null; keys(): IterableIterator<string> };

function readList(params: Params, key: string): string[] {
  return (params.get(key) ?? "").split(",").filter(Boolean);
}

/** A positive whole number, or null for anything else (bad values are ignored). */
function readPositiveNumber(params: Params, key: string): number | null {
  const value = Number(params.get(key));
  return Number.isInteger(value) && value > 0 ? value : null;
}

function readSort(params: Params): ProductSort {
  const value = params.get("sort");
  return PRODUCT_SORTS.find((sort) => sort === value) ?? "recommended";
}

function readSpecs(params: Params): ProductFilters["specs"] {
  const specs: ProductFilters["specs"] = {};
  for (const key of params.keys()) {
    if (key.startsWith(SPEC_PREFIX)) specs[key.slice(SPEC_PREFIX.length)] = readList(params, key);
  }
  return specs;
}

export function parseProductFilters(params: Params): ProductFilters {
  return {
    q: (params.get("q") ?? "").trim(),
    qualityIds: readList(params, LIST_KEYS.qualityIds),
    brandIds: readList(params, LIST_KEYS.brandIds),
    sizeLabels: readList(params, LIST_KEYS.sizeLabels),
    colourIds: readList(params, LIST_KEYS.colourIds),
    collectionIds: readList(params, LIST_KEYS.collectionIds),
    specs: readSpecs(params),
    priceMax: readPositiveNumber(params, "price_max"),
    discountMin: readPositiveNumber(params, "discount"),
    sort: readSort(params),
  };
}

/** Filters -> query string without empty values ("" when nothing is set). */
export function toFilterQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const [field, key] of Object.entries(LIST_KEYS)) {
    const values = filters[field as keyof typeof LIST_KEYS];
    if (values.length) params.set(key, values.join(","));
  }
  for (const [label, values] of Object.entries(filters.specs)) {
    if (values.length) params.set(`${SPEC_PREFIX}${label}`, values.join(","));
  }
  if (filters.priceMax) params.set("price_max", String(filters.priceMax));
  if (filters.discountMin) params.set("discount", String(filters.discountMin));
  if (filters.sort !== EMPTY_FILTERS.sort) params.set("sort", filters.sort);
  return params.toString();
}
