import { PRODUCT_STATUSES } from "@/constants/products";
import { parsePage, readChoice, readParam } from "@/lib/list-params";
import { PRODUCT_SORTS, type ProductAdminFilters } from "@/types/admin-products";

type SearchParams = Record<string, string | string[] | undefined>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** An id from the URL, or null for anything that is not a uuid. */
function readId(value: string | string[] | undefined): string | null {
  const text = readParam(value);
  return UUID_PATTERN.test(text) ? text : null;
}

/** `?q=&category=&status=&brand=&quality=&sort=&page=` -> filters. Invalid values are ignored. */
export function parseProductAdminFilters(params: SearchParams): ProductAdminFilters {
  const status = readParam(params.status);
  return {
    q: readParam(params.q),
    categoryId: readId(params.category),
    status: PRODUCT_STATUSES.find((item) => item === status) ?? null,
    brandId: readId(params.brand),
    qualityId: readId(params.quality),
    sort: readChoice(params.sort, PRODUCT_SORTS, "order"),
    page: parsePage(params.page),
  };
}

/** The URL keys the products toolbar controls ("Clear filters" removes them). */
export const PRODUCT_FILTER_PARAMS = ["q", "category", "status", "brand", "quality", "sort"];
