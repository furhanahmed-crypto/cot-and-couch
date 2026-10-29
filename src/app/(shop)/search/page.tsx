"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGridSkeleton } from "@/components/shop/shop-skeletons";
import { Input } from "@/components/ui/input";
import { searchProductsAction } from "@/app/(shop)/catalogue/actions";
import type { Product } from "@/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      setLoading(true);
      searchProductsAction(trimmed)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <h1 className="font-heading mb-2 text-3xl">Search</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Find mattresses and beds across the catalogue.
      </p>

      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try Wake Fit, Ideal Range, Queen…"
          className="pl-9"
          autoFocus
        />
      </div>

      {!q.trim() ? (
        <p className="text-sm text-muted-foreground">
          Start typing to see results.
        </p>
      ) : loading ? (
        <ProductGridSkeleton count={4} />
      ) : results.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No products match &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} results
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
