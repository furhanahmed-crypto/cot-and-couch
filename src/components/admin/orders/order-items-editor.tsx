"use client";

import { Package, Trash2 } from "lucide-react";
import { AddButton } from "@/components/admin/common/add-button";
import { EmptyState } from "@/components/admin/common/empty-state";
import { SectionCard } from "@/components/admin/common/section-card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import type { DraftOrderItem } from "@/types/admin-orders";
import type { OptionItem } from "@/types/admin-products";
import { AddOrderItemDialog } from "./add-order-item-dialog";

type OrderItemsEditorProps = {
  items: DraftOrderItem[];
  products: OptionItem[];
  onChange: (items: DraftOrderItem[]) => void;
  error?: string;
};

function describe(item: DraftOrderItem): string {
  const custom = item.customLengthIn && item.customWidthIn ? `Custom ${item.customLengthIn} x ${item.customWidthIn} in` : null;
  return [item.variantLabel, ...item.addonNames.map((name) => `+ ${name}`), custom].filter(Boolean).join(" · ");
}

/** The lines of a new order: add with the picker, remove with the bin. */
export function OrderItemsEditor({ items, products, onChange, error }: OrderItemsEditorProps) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <SectionCard
      title="Items"
      action={
        <AddButton
          label="Add item"
          variant="outline"
          renderDialog={(open, onOpenChange) => (
            <AddOrderItemDialog open={open} onOpenChange={onOpenChange} products={products} onAdd={(item) => onChange([...items, item])} />
          )}
        />
      }
    >
      {items.length ? (
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-3 py-3 first:pt-0">
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{describe(item)}</p>
              </div>
              <div className="flex shrink-0 items-start gap-2 text-right text-sm tabular-nums">
                <div>
                  <p className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} x {formatPrice(item.unitPrice)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${item.productName}`}
                  onClick={() => onChange(items.filter((other) => other.key !== item.key))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Package} title="No items yet" description="Add at least one item to create the order." />
      )}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
      <div className="flex justify-between border-t border-border/60 pt-3 text-sm font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </div>
    </SectionCard>
  );
}
