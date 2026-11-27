"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { removeCartItemAction } from "@/app/(shop)/cart/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { cn } from "@/lib/utils";
import { useShopStore } from "@/stores/shop-store";

export function CartRemoveButton({ cartItemId, className }: { cartItemId: string; className?: string }) {
  const router = useRouter();
  const setCartCount = useShopStore((state) => state.setCartCount);
  const [isOpen, setIsOpen] = useState(false);
  const { run, isPending } = useActionToast();

  function confirmRemove() {
    run(
      () => removeCartItemAction(cartItemId),
      { loading: "Removing item…", success: "Removed from cart", error: "Could not remove the item" },
      (data) => {
        setCartCount(data.cartCount);
        setIsOpen(false);
        router.refresh();
      },
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("size-10 text-destructive hover:bg-destructive/10 hover:text-destructive", className)}
        aria-label="Remove from cart"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Remove item?"
        description="This item will be removed from your cart. You can add it again later."
        confirmLabel="Remove"
        pending={isPending}
        onConfirm={confirmRemove}
      />
    </>
  );
}
