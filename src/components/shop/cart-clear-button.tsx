"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { clearCartAction } from "@/app/(shop)/cart/actions";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useActionToast } from "@/hooks/use-action-toast";
import { useShopStore } from "@/stores/shop-store";

export function CartClearButton() {
  const router = useRouter();
  const setCartCount = useShopStore((state) => state.setCartCount);
  const [isOpen, setIsOpen] = useState(false);
  const { run, isPending } = useActionToast();

  function confirmClear() {
    run(
      () => clearCartAction(),
      { loading: "Clearing cart…", success: "Cart cleared", error: "Could not clear the cart" },
      () => {
        setCartCount(0);
        setIsOpen(false);
        router.refresh();
      },
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" disabled={isPending} onClick={() => setIsOpen(true)}>
        <Trash2 className="size-4" />
        Clear cart
      </Button>
      <ConfirmationModal
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Clear cart?"
        description="All items will be removed from your cart. This cannot be undone."
        confirmLabel="Clear cart"
        pending={isPending}
        onConfirm={confirmClear}
      />
    </>
  );
}
