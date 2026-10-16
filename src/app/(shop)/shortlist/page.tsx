"use client";

import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { storeInfo } from "@/data/mock";
import { useShortlist } from "@/hooks/use-shortlist";
import { getProductsByIds } from "@/services/catalogue";

export default function ShortlistPage() {
  const { ids } = useShortlist();
  const products = getProductsByIds(ids);

  const share = () => {
    if (!products.length) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const lines = products.map(
      (p) => `• ${p.name} — ${origin}${ROUTES.product(p.slug)}`,
    );
    const text = `My Cot & Couch shortlist:\n\n${lines.join("\n")}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass">Saved</p>
          <h1 className="font-heading text-3xl">Shortlist</h1>
          <p className="text-sm text-muted-foreground">{products.length} items</p>
        </div>
        {products.length > 0 && (
          <Button
            type="button"
            onClick={share}
            className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
          >
            <Share2 className="size-4" />
            Share on WhatsApp
          </Button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No saved products yet.</p>
          <Link
            href={ROUTES.catalogue}
            className={cn(
              buttonVariants(),
              "mt-4 inline-flex bg-brass text-ink hover:bg-brass/90",
            )}
          >
            Browse catalogue
          </Link>
          <p className="mt-6 text-xs text-muted-foreground">
            Need help?{" "}
            <a
              href={`https://wa.me/${storeInfo.whatsapp}`}
              className="inline-flex items-center gap-1 text-brass underline-offset-2 hover:underline"
            >
              <MessageCircle className="size-3" /> WhatsApp us
            </a>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
