"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlParams } from "@/hooks/use-url-params";

type TableToolbarProps = {
  /** SearchInput and FilterSelect components. */
  children: ReactNode;
  /** URL keys this toolbar controls; "Clear filters" removes them. */
  paramNames: string[];
};

export function TableToolbar({ children, paramNames }: TableToolbarProps) {
  const { searchParams, setParams } = useUrlParams();
  const hasFilters = paramNames.some((name) => searchParams.has(name));

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {children}
      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setParams(Object.fromEntries(paramNames.map((name) => [name, null])))}
        >
          <X className="size-4" /> Clear filters
        </Button>
      ) : null}
    </div>
  );
}
