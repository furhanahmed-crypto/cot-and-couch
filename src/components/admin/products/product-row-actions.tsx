"use client";

import { useState } from "react";
import { deleteProductAction, setProductStatusAction } from "@/app/admin/products/actions";
import { RowActions, type RowAction } from "@/components/admin/common/row-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { ProductStatus } from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { useActionToast } from "@/hooks/use-action-toast";

type ProductRowActionsProps = { productId: string; name: string; slug: string; status: ProductStatus; isAdmin: boolean };
type Confirm = "unpublish" | "archive" | "delete" | null;

const STATUS_SUCCESS: Record<ProductStatus, string> = {
  published: "Product published",
  draft: "Product moved to drafts",
  archived: "Product archived",
};

export function ProductRowActions({ productId, name, slug, status, isAdmin }: ProductRowActionsProps) {
  const [confirm, setConfirm] = useState<Confirm>(null);
  const { run, isPending } = useActionToast();

  function changeStatus(next: ProductStatus) {
    run(
      () => setProductStatusAction(productId, next),
      { loading: "Saving…", success: STATUS_SUCCESS[next], error: "Could not change the status" },
      () => setConfirm(null),
    );
  }

  function remove() {
    run(() => deleteProductAction(productId), { loading: "Deleting product…", success: "Product deleted", error: "Could not delete the product" }, () =>
      setConfirm(null),
    );
  }

  const actions: RowAction[] = [{ label: "Edit", href: ROUTES.admin.product(productId) }];
  if (status === "published") actions.push({ label: "View in shop", href: ROUTES.product(slug) }, { label: "Unpublish", onSelect: () => setConfirm("unpublish") });
  else actions.push({ label: "Publish", onSelect: () => changeStatus("published") });
  if (status !== "archived") actions.push({ label: "Archive", onSelect: () => setConfirm("archive") });
  if (isAdmin) actions.push({ label: "Delete", onSelect: () => setConfirm("delete"), isDestructive: true });

  return (
    <>
      <RowActions label={name} actions={actions} />
      <ConfirmationModal
        open={confirm === "unpublish"}
        onOpenChange={(open) => setConfirm(open ? "unpublish" : null)}
        title={`Unpublish ${name}?`}
        description="It is hidden from the shop and moved to drafts. Carts show it as no longer available."
        confirmLabel="Unpublish"
        destructive={false}
        pending={isPending}
        onConfirm={() => changeStatus("draft")}
      />
      <ConfirmationModal
        open={confirm === "archive"}
        onOpenChange={(open) => setConfirm(open ? "archive" : null)}
        title={`Archive ${name}?`}
        description="It is hidden from the shop. Past orders keep it. You can publish it again later."
        confirmLabel="Archive"
        destructive={false}
        pending={isPending}
        onConfirm={() => changeStatus("archived")}
      />
      <ConfirmationModal
        open={confirm === "delete"}
        onOpenChange={(open) => setConfirm(open ? "delete" : null)}
        title={`Delete ${name}?`}
        description="Its variants, images and specs are deleted too. This cannot be undone. Products in orders cannot be deleted: archive them instead."
        confirmLabel="Delete"
        pending={isPending}
        onConfirm={remove}
      />
    </>
  );
}
