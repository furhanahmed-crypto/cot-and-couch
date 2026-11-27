import { SectionCard } from "@/components/admin/common/section-card";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from "@/constants/orders";
import { formatDateTime } from "@/lib/format";
import type { OrderHistoryEntry } from "@/types/admin-orders";

/** Every status the order has had, newest first (written by the database). */
export function OrderTimeline({ history }: { history: OrderHistoryEntry[] }) {
  return (
    <SectionCard title="Status history">
      <ol className="space-y-4">
        {history.map((entry) => (
          <li key={entry.id} className="space-y-1 border-l-2 border-border pl-3">
            <StatusBadge label={ORDER_STATUS_LABELS[entry.status]} tone={ORDER_STATUS_TONES[entry.status]} />
            <p className="text-xs text-muted-foreground">
              {formatDateTime(entry.changedAt)}
              {entry.changedByName ? ` · ${entry.changedByName}` : ""}
            </p>
            {entry.note ? <p className="text-sm">{entry.note}</p> : null}
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}
