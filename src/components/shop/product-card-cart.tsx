"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CartQuantityControls } from "@/components/shop/cart-quantity-controls";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/types";

function pickDefaultVariant(product: Product) {
  return (
    product.variants.find((v) => !v.isCustomSize) ?? product.variants[0] ?? null
  );
}

export function ProductCardCart({ product }: { product: Product }) {
  const { addItem, findLine } = useCart();
  const [pending, startTransition] = useTransition();
  const defaultVariant = pickDefaultVariant(product);
  const cartLine = findLine(product.id);

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
      className="mt-1 w-full bg-brass text-ink hover:bg-brass/90"
      disabled={pending || !defaultVariant}
      onClick={handleAddToCart}
      aria-label={`Add ${product.name} to cart`}
    >
      <ShoppingCart className="size-4" />
      {pending ? "Adding…" : "Add to cart"}
    </Button>
  );
}
