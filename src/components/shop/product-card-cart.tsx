"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CartQuantityControls } from "@/components/shop/cart-quantity-controls";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { displayProductName } from "@/lib/catalogue-utils";
import type { Product } from "@/types";

function pickDefaultVariant(product: Product, bedRangeId?: string | null) {
  let pool = product.variants.filter((v) => !v.isCustomSize);
  if (!pool.length) pool = product.variants;
  if (bedRangeId) {
    const scoped = pool.filter((v) => v.bedRangeId === bedRangeId);
    if (scoped.length) pool = scoped;
  }
  if (!pool.length) return null;
  return (
    [...pool].sort((a, b) => a.price - b.price)[0] ?? null
  );
}

export function ProductCardCart({
  product,
  bedRangeId = null,
}: {
  product: Product;
  /** Selected quality/range for this card (cots multi-range PLP). */
  bedRangeId?: string | null;
}) {
  const { addItem, findLine } = useCart();
  const [pending, startTransition] = useTransition();
  const defaultVariant = pickDefaultVariant(product, bedRangeId);
  const rangeName = bedRangeId
    ? product.availableRanges?.find((r) => r.id === bedRangeId)?.name
    : product.bedRangeName;
  const label = displayProductName(product.name, rangeName);
  const cartLine = findLine(
    product.id,
    defaultVariant?.id,
    null,
    null,
    [],
    bedRangeId,
  );

  function handleAddToCart() {
    if (!defaultVariant) {
      toast.error("This product has no variants yet.");
      return;
    }

    startTransition(async () => {
      const result = await addItem({
        productId: product.id,
        variantId: defaultVariant.id,
        quantity: 1,
        customLengthIn: null,
        customWidthIn: null,
        bedRangeId,
      });
      if (!result.ok) {
        toast.error(result.error ?? "Could not add to cart");
        return;
      }
      toast.success("Added to cart");
    });
  }

  if (cartLine) {
    return (
      <CartQuantityControls
        cartId={cartLine.id}
        quantity={cartLine.quantity}
        compact
        className="mt-1"
      />
    );
  }

  return (
    <Button
      type="button"
      className="mt-1 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      disabled={pending || !defaultVariant}
      onClick={handleAddToCart}
      aria-label={`Add ${label} to cart`}
    >
      <ShoppingCart className="size-4" />
      {pending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
