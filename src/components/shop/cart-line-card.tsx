import Image from "next/image";
import Link from "next/link";
import { CartQuantityControls } from "@/components/shop/cart-quantity-controls";
import { ROUTES } from "@/constants/routes";
import { formatINR } from "@/lib/format";
import type { CartLine } from "@/services/cart";

function buildConfigLabel(line: CartLine) {
  const parts: string[] = [];

  if (line.variant.sizeGroupLabel) {
    parts.push(line.variant.sizeGroupLabel);
  }

  if (line.variant.isCustomSize && line.customLengthIn && line.customWidthIn) {
    parts.push(`${line.customLengthIn}" × ${line.customWidthIn}"`);
  } else if (line.variant.sizeDimensionLabel) {
    parts.push(line.variant.sizeDimensionLabel);
  }

  if (line.variant.thicknessLabel) {
    parts.push(line.variant.thicknessLabel);
  }

  if (line.variant.colourName) {
    parts.push(line.variant.colourName);
  }

  return parts.join(" · ");
}

export function CartLineCard({ line }: { line: CartLine }) {
  const image =
    line.variant.images[0] ??
    line.product.variants.find((v) => v.images[0])?.images[0];
  const lineTotal = line.variant.price * line.quantity;
  const configLabel = buildConfigLabel(line);

  return (
    <article className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60 sm:gap-4 sm:p-4">
      <Link
        href={ROUTES.product(line.product.slug)}
        prefetch
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28"
      >
        {image ? (
          <Image
            src={image}
            alt={line.product.name}
            fill
            className="object-cover"
            sizes="112px"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link
              href={ROUTES.product(line.product.slug)}
              prefetch
              className="font-heading text-lg leading-snug hover:text-brass"
            >
              {line.product.name}
            </Link>
            {configLabel ? (
              <p className="text-sm text-muted-foreground">{configLabel}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">SKU {line.variant.sku}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatINR(lineTotal)}</p>
            <p className="text-xs text-muted-foreground">
              {formatINR(line.variant.price)} each
            </p>
          </div>
        </div>

        <CartQuantityControls cartId={line.id} quantity={line.quantity} />
      </div>
    </article>
  );
}
