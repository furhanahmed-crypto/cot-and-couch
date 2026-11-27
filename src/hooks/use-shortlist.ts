"use client";

import { setShortlistedAction } from "@/app/(shop)/shortlist/actions";
import { useActionToast } from "@/hooks/use-action-toast";
import { useShopStore } from "@/stores/shop-store";

const ADD_MESSAGES = {
  loading: "Adding to shortlist…",
  success: "Added to shortlist",
  error: "Could not update your shortlist",
};
const REMOVE_MESSAGES = {
  loading: "Removing from shortlist…",
  success: "Removed from shortlist",
  error: "Could not update your shortlist",
};

/** Heart button state for one product. `onChange` runs after a successful change. */
export function useShortlist(productId: string, onChange?: () => void) {
  const isShortlisted = useShopStore((state) => state.shortlistIds.includes(productId));
  const setShortlisted = useShopStore((state) => state.setShortlisted);
  const { run, isPending } = useActionToast();

  function toggle() {
    const next = !isShortlisted;
    run(() => setShortlistedAction(productId, next), next ? ADD_MESSAGES : REMOVE_MESSAGES, () => {
      setShortlisted(productId, next);
      onChange?.();
    });
  }

  return { isShortlisted, toggle, isPending };
}
