"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlParams } from "@/hooks/use-url-params";
import { formatPageRange, getLastPage } from "@/lib/list-params";

type TablePaginationProps = { page: number; pageSize: number; total: number };

/** "21–40 of 132" with Previous / Next. Writes `?page=`. */
export function TablePagination({ page, pageSize, total }: TablePaginationProps) {
  const { setParams } = useUrlParams();
  const lastPage = getLastPage(total, pageSize);
  if (total <= pageSize) return null;

  function goTo(next: number) {
    setParams({ page: next > 1 ? String(next) : null }, { keepPage: true });
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">{formatPageRange(page, total, pageSize)}</p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button type="button" variant="outline" size="sm" disabled={page >= lastPage} onClick={() => goTo(page + 1)}>
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
