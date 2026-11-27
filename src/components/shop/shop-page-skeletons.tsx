import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "./shop-skeletons";

export function ProductPageSkeleton() {
  return (
    <div className="pb-28">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
              <Skeleton className="h-10 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-6 h-24 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-12">
          <Skeleton className="mb-4 h-7 w-40" />
          <ProductGridSkeleton count={4} />
        </div>
      </div>
    </div>
  );
}

export function CollectionPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="mb-3 h-9 w-56" />
      <Skeleton className="mb-8 h-4 w-80 max-w-full" />
      <ProductGridSkeleton />
    </div>
  );
}

export function ShortlistPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Skeleton className="mb-2 h-3 w-16" />
      <Skeleton className="mb-6 h-9 w-36" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <Skeleton className="mb-2 h-9 w-32" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full" />
      <Skeleton className="mb-8 h-10 max-w-xl" />
      <ProductGridSkeleton count={4} />
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <Skeleton className="mb-2 h-3 w-16" />
      <Skeleton className="mb-6 h-9 w-40" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

export function ReelsStripSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-7 w-44" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-36 shrink-0 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
