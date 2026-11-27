import { SectionCard } from "@/components/admin/common/section-card";
import { formatPrice } from "@/lib/format";
import type { OrderDetail, OrderDetailItem } from "@/types/admin-orders";

function describeItem(item: OrderDetailItem): string {
  const custom = item.customLengthIn && item.customWidthIn ? `Custom ${item.customLengthIn} x ${item.customWidthIn} in` : null;
  return [item.sizeLabel, item.qualityName, item.colourName, custom].filter(Boolean).join(" · ");
}

function TotalRow({ label, amount, isStrong }: { label: string; amount: number; isStrong?: boolean }) {
  return (
    <div className={isStrong ? "flex justify-between font-semibold" : "flex justify-between text-muted-foreground"}>
      <span>{label}</span>
      <span className="tabular-nums">{formatPrice(amount)}</span>
    </div>
  );
}

/** Items as they were sold (snapshots), then the totals. */
export function OrderItemsCard({ order }: { order: OrderDetail }) {
  return (
    <SectionCard title={`Items (${order.items.length})`}>
      <ul className="divide-y divide-border/60">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 py-3 first:pt-0">
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{describeItem(item)}</p>
              <p className="text-xs text-muted-foreground">{item.sku}</p>
              {item.addons.map((addon) => (
                <p key={addon.id} className="text-xs">
                  + {addon.name} <span className="text-muted-foreground">({formatPrice(addon.price)})</span>
                </p>
              ))}
            </div>
            <div className="shrink-0 text-right text-sm tabular-nums">
              <p className="font-medium">{formatPrice(item.lineTotal)}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity} x {formatPrice(item.unitPrice)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-border/60 pt-3 text-sm">
        <TotalRow label="Total" amount={order.subtotal} isStrong />
        <TotalRow label="Advance paid" amount={order.advancePaid} />
        <TotalRow label="Balance" amount={order.subtotal - order.advancePaid} isStrong />
      </div>
    </SectionCard>
  );
}
