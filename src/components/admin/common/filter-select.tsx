"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUrlParams } from "@/hooks/use-url-params";

const ALL_VALUE = "__all__";

export type FilterSelectOption = { value: string; label: string };

type FilterSelectProps = {
  /** URL key, e.g. "status" for `?status=`. */
  paramName: string;
  /** Shown for the "no filter" choice, e.g. "All statuses". */
  allLabel: string;
  options: FilterSelectOption[];
};

/** One filter. Choosing the "All…" option removes it from the URL. */
export function FilterSelect({ paramName, allLabel, options }: FilterSelectProps) {
  const { searchParams, setParams } = useUrlParams();
  const current = searchParams.get(paramName);
  const value = options.some((option) => option.value === current) ? current! : ALL_VALUE;
  const items = [{ value: ALL_VALUE, label: allLabel }, ...options];

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => setParams({ [paramName]: next === ALL_VALUE ? null : (next as string) })}
    >
      <SelectTrigger className="w-full sm:w-44" aria-label={allLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
