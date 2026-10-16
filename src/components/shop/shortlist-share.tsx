"use client";

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/types";

export function ShortlistShare({ products }: { products: Product[] }) {
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
    <Button
      type="button"
      onClick={share}
      className="bg-[#25D366] text-white hover:bg-[#25D366]/90"
    >
      <Share2 className="size-4" />
      Share on WhatsApp
    </Button>
  );
}
