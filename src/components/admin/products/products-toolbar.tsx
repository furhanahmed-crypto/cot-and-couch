"use client";

import { FilterSelect } from "@/components/admin/common/filter-select";
import { SearchInput } from "@/components/admin/common/search-input";
import { TableToolbar } from "@/components/admin/common/table-toolbar";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/constants/products";
import { PRODUCT_FILTER_PARAMS } from "@/lib/product-admin-params";
import type { OptionItem, ProductFilterOptions } from "@/types/admin-products";

const SORT_OPTIONS = [
  { value: "updated", label: "Sort: Recently updated" },
  { value: "name", label: "Sort: Name" },
  { value: "price", label: "Sort: Price" },
];

function toOptions(items: OptionItem[]) {
  return items.map((item) => ({ value: item.id, label: item.name }));
}

/** Search · Category · Status · Brand or Quality (once a category is chosen) · Sort. */
export function ProductsToolbar({ options }: { options: ProductFilterOptions }) {
  return (
    <TableToolbar paramNames={PRODUCT_FILTER_PARAMS}>
      <SearchInput placeholder="Search name or SKU" />
      <FilterSelect paramName="category" allLabel="All categories" options={toOptions(options.categories)} clearsParams={["brand", "quality"]} />
      <FilterSelect
        paramName="status"
        allLabel="All statuses"
        options={PRODUCT_STATUSES.map((status) => ({ value: status, label: PRODUCT_STATUS_LABELS[status] }))}
      />
      {options.brands.length ? <FilterSelect paramName="brand" allLabel="All brands" options={toOptions(options.brands)} /> : null}
      {options.qualities.length ? <FilterSelect paramName="quality" allLabel="All qualities" options={toOptions(options.qualities)} /> : null}
      <FilterSelect paramName="sort" allLabel="Sort: Shop order" options={SORT_OPTIONS} />
    </TableToolbar>
  );
}
