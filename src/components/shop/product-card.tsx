"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCardCart } from "@/components/shop/product-card-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useShortlist } from "@/hooks/use-shortlist";
import { discountPercent, formatINR, stockLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  maxDiscount,
  productColours,
  startingPrice,
  worstStock,
} from "@/lib/catalogue-utils";
import type { Product } from "@/types";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { has, toggle } = useShortlist();
  const price = startingPrice(product);
  const mrp = product.variants.length
    ? Math.min(...product.variants.map((v) => v.mrp))
    : 0;
  const off = maxDiscount(product);
  const allColours = productColours(product);
  const swatches = allColours.slice(0, 4);
  const extra = allColours.length - swatches.length;
  const stock = worstStock(product);
  const img = product.variants[0]?.images[0] ?? undefined;
  const liked = has(product.id);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <Link
        href={ROUTES.product(product.slug)}
        prefetch={false}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {img && (
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        )}
        {off >= 10 && (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground hover:bg-primary">
            Up to {off}% off
          </Badge>
        )}
      </Link>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute right-2 top-2 z-10 size-8 rounded-full"
        aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
        onClick={() => toggle(product.id)}
      >
        <Heart className={cn("size-4", liked && "fill-destructive text-destructive")} />
      </Button>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={ROUTES.product(product.slug)}
          prefetch={false}
          className="font-medium leading-snug hover:text-brass"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-semibold">from {formatINR(price)}</span>
          <span className="text-sm text-muted-foreground line-through">
            {formatINR(mrp)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          {swatches.map((c) => (
            <span
              key={c.id}
              title={c.name}
              className="size-3.5 rounded-full ring-1 ring-border"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          {extra > 0 && (
            <span className="text-xs text-muted-foreground">+{extra} colours</span>
          )}
        </div>
        <Badge variant="outline" className="mt-auto w-fit text-[10px] uppercase tracking-wide">
          {stockLabel(
            stock,
            product.variants.find((v) => v.stockStatus === stock)?.stockQty ?? 0,
          )}
        </Badge>
        <ProductCardCart product={product} />
        <span className="sr-only">
          Discount {discountPercent(mrp, price)} percent
        </span>
      </div>
    </article>
  );
}
