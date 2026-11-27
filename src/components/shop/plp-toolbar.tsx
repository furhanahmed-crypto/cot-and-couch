"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductFilters, ProductSort } from "@/lib/product-filters";
import type { QualityItem } from "@/types/catalogue";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "discount", label: "Highest discount" },
  { value: "newest", label: "Newest" },
];

type PlpToolbarProps = {
  filters: ProductFilters;
  qualities: QualityItem[];
  resultCount: number;
  onChange: (next: ProductFilters) => void;
  /** The mobile filters button. */
  children: ReactNode;
};

/** Quality chips, search in category, sort and result count. */
export function PlpToolbar({ filters, qualities, resultCount, onChange, children }: PlpToolbarProps) {
  return (
    <div className="mb-4 space-y-3">
      {qualities.length > 1 ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Badge
            render={<button type="button" />}
            variant={filters.qualityIds.length ? "outline" : "default"}
            className="shrink-0 cursor-pointer"
            onClick={() => onChange({ ...filters, qualityIds: [] })}
          >
            All qualities
          </Badge>
          {qualities.map((quality) => {
            const isOn = filters.qualityIds.length === 1 && filters.qualityIds[0] === quality.id;
            return (
              <Badge
                key={quality.id}
                render={<button type="button" />}
                variant={isOn ? "default" : "outline"}
                className="shrink-0 cursor-pointer"
                onClick={() => onChange({ ...filters, qualityIds: isOn ? [] : [quality.id] })}
              >
                {quality.name}
              </Badge>
            );
          })}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          defaultValue={filters.q}
          onChange={(event) => onChange({ ...filters, q: event.target.value.trim() })}
          placeholder="Search in this category…"
          aria-label="Search in this category"
          className="sm:max-w-xs"
        />
        <div className="flex items-center gap-2">
          <Select
            items={SORT_OPTIONS}
            value={filters.sort}
            onValueChange={(value) => onChange({ ...filters, sort: (value as ProductSort) ?? "recommended" })}
          >
            <SelectTrigger className="w-44" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {children}
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto">{resultCount} results</p>
      </div>
    </div>
  );
}
