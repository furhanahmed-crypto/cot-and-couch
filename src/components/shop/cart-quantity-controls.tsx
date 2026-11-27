"use client";

import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { setCartQuantityAction } from "@/app/(shop)/cart/actions";
import { CartRemoveButton } from "@/components/shop/cart-remove-button";
import { Button } from "@/components/ui/button";
import { useActionToast } from "@/hooks/use-action-toast";
import { CART_QUANTITY_MAX } from "@/validation/shop";

type CartQuantityControlsProps = { cartItemId: string; quantity: number };

export function CartQuantityControls({ cartItemId, quantity }: CartQuantityControlsProps) {
  const router = useRouter();
  const { run, isPending } = useActionToast();

  function changeQuantity(next: number) {
    run(
      () => setCartQuantityAction(cartItemId, next),
      { loading: "Updating quantity…", success: "Quantity updated", error: "Could not change the quantity" },
      router.refresh,
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-none"
          aria-label="Decrease quantity"
          disabled={isPending || quantity <= 1}
          onClick={() => changeQuantity(quantity - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="flex h-10 min-w-10 items-center justify-center border-x border-border px-2 text-sm font-medium tabular-nums">
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 rounded-none"
          aria-label="Increase quantity"
          disabled={isPending || quantity >= CART_QUANTITY_MAX}
          onClick={() => changeQuantity(quantity + 1)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <CartRemoveButton cartItemId={cartItemId} />
    </div>
  );
}
