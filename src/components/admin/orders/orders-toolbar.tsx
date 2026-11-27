"use client";

import { FilterSelect } from "@/components/admin/common/filter-select";
import { SearchInput } from "@/components/admin/common/search-input";
import { TableToolbar } from "@/components/admin/common/table-toolbar";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/constants/orders";
import { ORDER_FILTER_PARAMS } from "@/lib/order-admin-params";

const STATUS_OPTIONS = ORDER_STATUSES.map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] }));
const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

/** Search · Status · Date. */
export function OrdersToolbar() {
  return (
    <TableToolbar paramNames={ORDER_FILTER_PARAMS}>
      <SearchInput placeholder="Search order no., name or phone" />
      <FilterSelect paramName="status" allLabel="All statuses" options={STATUS_OPTIONS} />
      <FilterSelect paramName="range" allLabel="All dates" options={RANGE_OPTIONS} />
    </TableToolbar>
  );
}
