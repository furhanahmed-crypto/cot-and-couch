import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ROWS = 8;
const FORM_FIELDS = 5;

/** `loading.tsx` for list pages: header, toolbar and table rows. */
export function TableSkeleton({ rows = DEFAULT_ROWS }: { rows?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="space-y-2 rounded-xl bg-card p-4 ring-1 ring-border/60">
        {Array.from({ length: rows }, (_, row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

/** `loading.tsx` for editors: header and labelled inputs. */
export function FormSkeleton() {
  return (
    <div className="max-w-2xl space-y-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-7 w-56" />
      {Array.from({ length: FORM_FIELDS }, (_, field) => (
        <div key={field} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
