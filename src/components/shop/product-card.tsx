import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { ShortlistButton } from "@/components/shop/shortlist-button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/format";
import { EMPTY_FILTERS, getCardPrice, type CardPrice } from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { ProductCardItem } from "@/types/catalogue";

const MAX_SWATCHES = 4;
const MIN_BADGE_DISCOUNT = 10;

type ProductCardProps = {
  card: ProductCardItem;
  /** Price for the current filters. Defaults to the cheapest variant. */
  price?: CardPrice | null;
  /** Opens the product page on this quality. */
  qualityId?: string | null;
  className?: string;
  refreshOnShortlistChange?: boolean;
};

export function ProductCard({ card, price, qualityId, className, refreshOnShortlistChange }: ProductCardProps) {
  const shown = price ?? getCardPrice(card, EMPTY_FILTERS);
  const href = ROUTES.product(card.slug, qualityId);
  const swatches = card.colours.slice(0, MAX_SWATCHES);
  const extraColours = card.colours.length - swatches.length;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <Link href={href} prefetch={false} className="relative block aspect-[4/5] overflow-hidden bg-muted">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 50vw, 25vw"
          />
        ) : (
          <ImageOff className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
        )}
        {shown && shown.discount >= MIN_BADGE_DISCOUNT ? (
          <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground hover:bg-primary">
            Up to {shown.discount}% off
          </Badge>
        ) : null}
      </Link>
      <ShortlistButton productId={card.id} className="absolute right-2 top-2 z-10 size-8" refreshOnChange={refreshOnShortlistChange} />
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        {card.brandName ? <p className="text-xs text-muted-foreground">{card.brandName}</p> : null}
        <Link href={href} prefetch={false} className="font-medium leading-snug hover:text-brass">
          {card.name}
        </Link>
        {shown ? (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base font-semibold">from {formatPrice(shown.price)}</span>
            {shown.mrp && shown.mrp > shown.price ? (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(shown.mrp)}</span>
            ) : null}
          </div>
        ) : null}
        {swatches.length ? (
          <div className="mt-auto flex items-center gap-1.5 pt-1">
            {swatches.map((colour) => (
              <span
                key={colour.id}
                title={colour.name}
                className="size-3.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: colour.hex }}
              />
            ))}
            {extraColours > 0 ? <span className="text-xs text-muted-foreground">+{extraColours}</span> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
