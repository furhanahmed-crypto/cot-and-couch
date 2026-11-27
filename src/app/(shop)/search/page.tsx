import { Suspense } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGridSkeleton } from "@/components/shop/shop-skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchProductCards } from "@/services/catalogue/product-card-queries";

type SearchParams = Promise<{ q?: string | string[] }>;

async function readQuery(searchParams: SearchParams): Promise<string> {
  const { q } = await searchParams;
  return typeof q === "string" ? q.trim() : "";
}

async function SearchForm({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  return (
    <form action="" className="relative mb-8 flex max-w-xl gap-2" role="search">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input name="q" defaultValue={query} placeholder="Try Wake Fit, Prime Range, Teak Sofa…" className="pl-9" aria-label="Search products" autoFocus />
      <Button type="submit">Search</Button>
    </form>
  );
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const query = await readQuery(searchParams);
  if (!query) return <p className="text-sm text-muted-foreground">Type a product or brand name and press Search.</p>;
  const cards = await searchProductCards(query);
  if (!cards.length) {
    return <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">No products match “{query}”.</div>;
  }
  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{cards.length} results</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <ProductCard key={card.id} card={card} />
        ))}
      </div>
    </>
  );
}

/** The query lives in the URL (?q=), so results can be shared and the back button works. */
export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-2 font-heading text-3xl">Search</h1>
      <p className="mb-6 text-sm text-muted-foreground">Find mattresses, beds and sofas across the catalogue.</p>
      <Suspense fallback={null}>
        <SearchForm searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
