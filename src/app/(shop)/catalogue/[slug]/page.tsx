"use client";

import { use, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { FilterPanel } from "@/components/shop/filter-panel";
import { ProductCard } from "@/components/shop/product-card";
import { ReelsStrip } from "@/components/shop/reels-strip";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { attributeTemplates } from "@/data/mock";
import { STORAGE_KEYS } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  filterProducts,
  getCategoryBySlug,
  type FilterState,
  type SortKey,
} from "@/services/catalogue";
import { writeJson } from "@/services/storage";

const SORT_ITEMS = [
  { value: "popularity", label: "Popularity" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "discount", label: "Highest discount" },
];

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const category = getCategoryBySlug(slug);
  const template = attributeTemplates.find((t) => t.id === category?.templateId);
  const [sort, setSort] = useState<SortKey>("popularity");
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    if (!category) return;
    writeJson(STORAGE_KEYS.lastBrowse, {
      path: `/catalogue/${category.slug}`,
      filters,
    });
  }, [category, filters]);

  const list = useMemo(() => {
    if (!category) return [];
    return filterProducts(category.id, filters, sort);
  }, [category, filters, sort]);

  if (!category) {
    return <p className="p-8 text-center text-muted-foreground">Category not found.</p>;
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-8">
      <div className="mb-5 space-y-3 md:mb-6">
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">{category.name}</h1>
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
              <div className="mt-4 px-1 pb-6">
                <FilterPanel
                  filters={filters}
                  onChange={setFilters}
                  extraFields={template?.fields}
                  onClear={() => setFilters({})}
                />
              </div>
            </SheetContent>
          </Sheet>
          <p className="ml-auto text-sm text-muted-foreground sm:ml-0">
            {list.length} results
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20 rounded-xl bg-card p-4 ring-1 ring-border">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              extraFields={template?.fields}
              onClear={() => setFilters({})}
            />
          </div>
        </aside>
        <div>
          {list.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              No products match these filters. Try clearing filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <div className="mt-10">
            <ReelsStrip tag={category.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
