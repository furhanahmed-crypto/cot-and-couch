import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { CartQuantityControls } from "@/components/shop/cart-quantity-controls";
import { CartRemoveButton } from "@/components/shop/cart-remove-button";
import { ROUTES } from "@/constants/routes";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/types/cart";

/** "Ideal Range · King · 78 x 72 in · Teak" — custom size replaces the standard one. */
function describeLine(line: CartLine): string {
  const size =
    line.customLengthIn && line.customWidthIn
      ? `Custom ${line.customLengthIn} x ${line.customWidthIn} in`
      : [line.sizeLabel, line.lengthIn && line.widthIn ? `${line.lengthIn} x ${line.widthIn} in` : null].filter(Boolean).join(" · ");
  const thickness = line.thicknessIn ? `${line.thicknessIn} in thick` : null;
  return [line.qualityName, size, thickness, line.colourName].filter(Boolean).join(" · ");
}

export function CartLineCard({ line }: { line: CartLine }) {
  const href = ROUTES.product(line.productSlug, line.qualityId);

  return (
    <article className="flex gap-3 rounded-xl bg-card p-3 ring-1 ring-border/60 sm:gap-4 sm:p-4">
      <Link href={href} className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
        {line.imageUrl ? (
          <Image src={line.imageUrl} alt={line.productName} fill className="object-cover" sizes="112px" />
        ) : (
          <ImageOff className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <Link href={href} className="font-heading text-lg leading-snug hover:text-brass">
              {line.productName}
            </Link>
            <p className="text-sm text-muted-foreground">{describeLine(line)}</p>
            {line.addons.length ? (
              <ul className="space-y-0.5 text-xs text-muted-foreground">
                {line.addons.map((addon) => (
                  <li key={addon.id}>
                    + {addon.name} ({formatPrice(addon.unitPrice)})
                  </li>
                ))}
              </ul>
            ) : null}
            {line.removedAddonNames.length ? (
              <p className="text-xs text-destructive">No longer offered, not counted: {line.removedAddonNames.join(", ")}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">SKU {line.sku}</p>
          </div>
          {line.isAvailable ? (
            <div className="text-right">
              <p className="font-semibold">{formatPrice(line.lineTotal)}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(line.unitTotal)} each</p>
            </div>
          ) : (
            <p className="text-sm font-medium text-destructive">No longer available</p>
          )}
        </div>
        {line.isAvailable ? (
          <CartQuantityControls cartItemId={line.id} quantity={line.quantity} />
        ) : (
          <CartRemoveButton cartItemId={line.id} className="w-fit" />
        )}
      </div>
    </article>
  );
}
