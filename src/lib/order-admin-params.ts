import { ORDER_STATUSES } from "@/constants/orders";
import { parsePage, readChoice, readParam } from "@/lib/list-params";
import { ORDER_DATE_RANGES, type OrderAdminFilters } from "@/types/admin-orders";

type SearchParams = Record<string, string | string[] | undefined>;

/** `?q=&status=&range=&page=` -> filters. Invalid values are ignored. */
export function parseOrderAdminFilters(params: SearchParams): OrderAdminFilters {
  const status = readParam(params.status);
  return {
    q: readParam(params.q),
    status: ORDER_STATUSES.find((item) => item === status) ?? null,
    range: readChoice(params.range, ORDER_DATE_RANGES, "all"),
    page: parsePage(params.page),
  };
}

/** The URL keys the orders toolbar controls ("Clear filters" removes them). */
export const ORDER_FILTER_PARAMS = ["q", "status", "range"];
