import { Skeleton } from "@/components/ui/skeleton";

export function ShopHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:h-16 md:px-6">
        <Skeleton className="size-9 shrink-0 lg:hidden" />
        <Skeleton className="h-7 w-36" />
        <div className="ml-4 hidden items-center gap-2 lg:flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
    </header>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-border/60">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className = "grid grid-cols-2 gap-3 md:grid-cols-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div>
      <Skeleton className="min-h-[72vh] w-full rounded-none md:min-h-[78vh]" />
      <div className="mx-auto max-w-7xl space-y-10 px-3 py-8 sm:px-4 sm:py-10 md:space-y-12 md:px-6 md:py-14">
        <section>
          <Skeleton className="mb-4 h-8 w-56" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[5/4] rounded-2xl" />
            ))}
          </div>
        </section>
        <section>
          <Skeleton className="mb-4 h-8 w-40" />
          <ProductGridSkeleton />
        </section>
        <section>
          <Skeleton className="mb-4 h-8 w-36" />
          <ProductGridSkeleton count={6} className="grid grid-cols-2 gap-3 md:grid-cols-3" />
        </section>
      </div>
    </div>
  );
}

export function CatalogueIndexSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <Skeleton className="mb-6 h-9 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function CategoryPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6 md:py-8">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-6 h-4 w-32" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
