"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeFromCartAction } from "@/app/(shop)/cart/actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export function CartRemoveButton({
  cartId,
  className,
}: {
  cartId: string;
  className?: string;
}) {
  const router = useRouter();
  const { refreshLines } = useCart();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmRemove() {
    startTransition(async () => {
      const result = await removeFromCartAction(cartId);
      if (!result.ok) {
        toast.error(result.error ?? "Could not remove item");
        return;
      }
      await refreshLines();
      router.refresh();
      setOpen(false);
      toast.success("Removed from cart");
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "text-destructive hover:bg-destructive/10 hover:text-destructive",
          className,
        )}
        aria-label="Remove from cart"
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>
      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        title="Remove item?"
        description="This item will be removed from your cart. You can add it again later."
        confirmLabel="Remove"
        pending={pending}
        onConfirm={confirmRemove}
      />
    </>
  );
}
