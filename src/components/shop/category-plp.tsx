"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { FilterPanel, type FilterOptions } from "@/components/shop/filter-panel";
import { PlpToolbar } from "@/components/shop/plp-toolbar";
import { ProductCard } from "@/components/shop/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STORAGE_KEYS } from "@/constants/routes";
import { writeJson } from "@/lib/local-storage";
import { parseProductFilters, toFilterQuery } from "@/lib/product-filter-params";
import { countActiveFilters, EMPTY_FILTERS, filterAndSortCards, type ProductFilters } from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { CategoryFacets } from "@/services/catalogue/category-queries";
import type { CategoryItem, CollectionItem, ProductCardItem } from "@/types/catalogue";

type CategoryPlpProps = {
  category: CategoryItem;
  cards: ProductCardItem[];
  facets: CategoryFacets;
  collections: CollectionItem[];
};

/** Filter options from what the listed products actually use. */
function buildFilterOptions(cards: ProductCardItem[], facets: CategoryFacets, collections: CollectionItem[]): FilterOptions {
  const sizes = [...new Set(cards.flatMap((card) => card.variants.map((variant) => variant.sizeLabel)))];
  const specValues = new Map<string, Set<string>>();
  for (const card of cards) {
    for (const [label, value] of Object.entries(card.specs)) {
      specValues.set(label, (specValues.get(label) ?? new Set()).add(value));
    }
  }
  const usedCollectionIds = new Set(cards.flatMap((card) => card.collectionIds));
  return {
    qualities: facets.qualities.map((quality) => ({ value: quality.id, label: quality.name })),
    brands: facets.brands.map((brand) => ({ value: brand.id, label: brand.name })),
    sizes: sizes.map((size) => ({ value: size, label: size })),
    colours: facets.colours.map((colour) => ({ value: colour.id, label: colour.name, hex: colour.hex })),
    collections: collections
      .filter((collection) => usedCollectionIds.has(collection.id))
      .map((collection) => ({ value: collection.id, label: collection.name })),
    specs: [...specValues].map(([label, values]) => ({ label, values: [...values].sort() })),
  };
}

export function CategoryPlp({ category, cards, facets, collections }: CategoryPlpProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const filters = useMemo(() => parseProductFilters(new URLSearchParams(query)), [query]);
  const results = useMemo(() => filterAndSortCards(cards, filters), [cards, filters]);
  const options = useMemo(() => buildFilterOptions(cards, facets, collections), [cards, facets, collections]);
  const linkQualityId = filters.qualityIds.length === 1 ? filters.qualityIds[0] : null;

  useEffect(() => {
    writeJson(STORAGE_KEYS.lastBrowse, { path: query ? `${pathname}?${query}` : pathname });
  }, [pathname, query]);

  function updateFilters(next: ProductFilters) {
    const nextQuery = toFilterQuery(next);
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }

  const panel = <FilterPanel filters={filters} options={options} onChange={updateFilters} />;

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-8">
      <h1 className="mb-5 font-heading text-2xl sm:text-3xl md:text-4xl">{category.name}</h1>
      <PlpToolbar filters={filters} qualities={facets.qualities} resultCount={results.length} onChange={updateFilters}>
        <Sheet>
          <SheetTrigger className={cn(buttonVariants({ variant: "outline" }), "gap-2 md:hidden")}>
            <SlidersHorizontal className="size-4" /> Filters
            {countActiveFilters(filters) ? ` (${countActiveFilters(filters)})` : ""}
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">{panel}</div>
          </SheetContent>
        </Sheet>
      </PlpToolbar>

      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:block">
          <div className="sticky top-20 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-xl bg-card p-4 ring-1 ring-border">
            {panel}
          </div>
        </aside>
        {results.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            <p>No products match these filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => updateFilters({ ...EMPTY_FILTERS })}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {results.map(({ card, price }) => (
              <ProductCard key={card.id} card={card} price={price} qualityId={linkQualityId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
