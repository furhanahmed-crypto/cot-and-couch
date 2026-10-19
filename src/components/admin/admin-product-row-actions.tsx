"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Trash2 } from "lucide-react";
import {
  archiveProductAction,
  deleteProductAction,
} from "@/app/admin/catalogue/product-actions";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export function AdminProductRowActions({ product }: { product: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function archive() {
    startTransition(async () => {
      await archiveProductAction(product.id);
      router.refresh();
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      await deleteProductAction(product.id);
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || product.status === "archived"}
        onClick={archive}
      >
        <Archive className="size-3.5" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive"
        disabled={pending}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="size-3.5" />
      </Button>
      <ConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete product?"
        description={`${product.name} and its variants will be permanently removed.`}
        confirmLabel="Delete"
        pending={pending}
        onConfirm={confirmDelete}
      />
    </>
  );
}
