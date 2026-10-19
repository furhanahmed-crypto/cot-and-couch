"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  decreaseCartQuantityAction,
  increaseCartQuantityAction,
} from "@/app/(shop)/cart/actions";
import { CartRemoveButton } from "@/components/shop/cart-remove-button";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function CartQuantityControls({
  cartId,
  quantity,
  className,
  compact = false,
}: {
  cartId: string;
  quantity: number;
  className?: string;
  /** Smaller controls for product cards. */
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { refreshLines } = useCart();
  const buttonSize = compact ? "size-9" : "size-10";

  function afterChange() {
    void refreshLines();
    router.refresh();
  }

  function increase() {
    startTransition(async () => {
      const result = await increaseCartQuantityAction(cartId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not update quantity");
        return;
      }
      afterChange();
    });
  }

  function decrease() {
    startTransition(async () => {
      const result = await decreaseCartQuantityAction(cartId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not update quantity");
        return;
      }
      afterChange();
      if (result.removed) {
        toast.success("Removed from cart");
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(buttonSize, "rounded-none")}
          aria-label="Decrease quantity"
          disabled={pending || quantity <= 1}
          onClick={decrease}
        >
          <Minus className="size-4" />
        </Button>
        <span
          className={cn(
            "flex min-w-10 items-center justify-center border-x border-border px-2 text-sm font-medium tabular-nums",
            compact ? "h-9" : "h-10",
          )}
        >
          {quantity}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(buttonSize, "rounded-none")}
          aria-label="Increase quantity"
          disabled={pending}
          onClick={increase}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <CartRemoveButton cartId={cartId} className={buttonSize} />
    </div>
  );
}
