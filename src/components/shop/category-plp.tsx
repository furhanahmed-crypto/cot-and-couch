"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterPanel } from "@/components/shop/filter-panel";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { STORAGE_KEYS } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  filterProductList,
  productWidthLabels,
  type FilterState,
  type SortKey,
} from "@/lib/catalogue-utils";
import { writeJson } from "@/services/storage";
import type { Category, Collection, Colour, Product } from "@/types";

const SORT_ITEMS = [
  { value: "popularity", label: "Popularity" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "discount", label: "Highest discount" },
];

const MATTRESS_ATTR_FACETS = [
  { key: "purpose", label: "Mattress type" },
  { key: "comfort", label: "Firmness" },
  { key: "filling", label: "Layer construction" },
  { key: "cover", label: "Cover fabric" },
] as const;

export function CategoryPlp({
  category,
  products,
  colours,
  collections,
}: {
  category: Category;
  products: Product[];
  colours: Colour[];
  collections: Collection[];
}) {
  const [sort, setSort] = useState<SortKey>("popularity");
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    writeJson(STORAGE_KEYS.lastBrowse, {
      path: `/catalogue/${category.slug}`,
      filters,
    });
  }, [category.slug, filters]);

  const isBeds = category.slug === "cots";
  const isMattresses = category.slug === "mattresses";

  const bedRanges = useMemo(() => {
    if (!isBeds) return [];
    const map = new Map<string, string>();
    for (const p of products) {
      if (p.bedRangeId && p.bedRangeName) map.set(p.bedRangeId, p.bedRangeName);
    }
    return [...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products, isBeds]);

  const widths = useMemo(() => {
    if (!isBeds) return [];
    const set = new Set<string>();
    for (const p of products) {
      for (const w of productWidthLabels(p)) set.add(w);
    }
    return [...set].sort();
  }, [products, isBeds]);

  const attrFacets = useMemo(() => {
    if (!isMattresses) return [];
    return MATTRESS_ATTR_FACETS.map((facet) => {
      const opts = new Set<string>();
      for (const p of products) {
        const v = p.specs[facet.key];
        if (typeof v === "string" && v) opts.add(v);
      }
      return {
        key: facet.key,
        label: facet.label,
        options: [...opts].sort(),
      };
    }).filter((f) => f.options.length > 0);
  }, [products, isMattresses]);

  const plpColours = useMemo(() => {
    if (isMattresses) return [];
    const ids = new Set<string>();
    for (const p of products) {
      for (const v of p.variants) {
        if (v.colourId) ids.add(v.colourId);
      }
    }
    return colours.filter((c) => ids.has(c.id));
  }, [products, colours, isMattresses]);

  const list = useMemo(
    () =>
      filterProductList(
        products,
        category.id,
        filters,
        sort,
        new Map([[category.id, category.name]]),
      ),
    [products, category.id, category.name, filters, sort],
  );

  const filterPanel = (
    <FilterPanel
      filters={filters}
      onChange={setFilters}
      colours={plpColours}
      collections={collections}
      bedRanges={bedRanges}
      widths={widths}
      attrFacets={attrFacets}
      onClear={() => setFilters({})}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-8">
      <div className="mb-5 space-y-3 md:mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">
          {category.name}
        </h1>
        {isBeds && bedRanges.length > 0 ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            <Badge
              variant={!filters.bedRanges?.length ? "default" : "outline"}
              className="shrink-0 cursor-pointer"
              onClick={() =>
                setFilters((f) => ({ ...f, bedRanges: undefined }))
              }
            >
              All ranges
            </Badge>
            {bedRanges.map((r) => {
              const on = filters.bedRanges?.includes(r.id);
              return (
                <Badge
                  key={r.id}
                  variant={on ? "default" : "outline"}
                  className="shrink-0 cursor-pointer"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      bedRanges: on ? undefined : [r.id],
                    }))
                  }
                >
                  {r.label}
                </Badge>
              );
            })}
          </div>
        ) : category.subCategories.length > 0 ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
            <Badge
              variant={!filters.subCategory ? "default" : "outline"}
              className="shrink-0 cursor-pointer"
              onClick={() =>
                setFilters((f) => ({ ...f, subCategory: undefined }))
              }
            >
              All
            </Badge>
            {category.subCategories.map((sc) => (
              <Badge
                key={sc.id}
                variant={filters.subCategory === sc.id ? "default" : "outline"}
                className="shrink-0 cursor-pointer"
                onClick={() =>
                  setFilters((f) => ({ ...f, subCategory: sc.id }))
                }
              >
                {sc.name}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={filters.q ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, q: e.target.value || undefined }))
          }
          placeholder="Search in category…"
          className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm sm:min-w-[12rem] sm:flex-1 md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            items={SORT_ITEMS}
            value={sort}
            onValueChange={(v) => {
              if (typeof v === "string") setSort(v as SortKey);
            }}
          >
            <SelectTrigger className="w-full min-w-[10rem] flex-1 sm:w-44 sm:flex-none">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex items-center gap-2 md:hidden",
              )}
            >
              <SlidersHorizontal className="size-4" /> Filters
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4 px-1 pb-6">{filterPanel}</div>
            </SheetContent>
          </Sheet>
          <p className="ml-auto text-sm text-muted-foreground sm:ml-0">
            {list.length} results
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20 max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain rounded-xl bg-card p-4 ring-1 ring-border">
            {filterPanel}
          </div>
        </aside>
        <div>
          {list.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No products match these filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
