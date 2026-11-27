import { LEAD_CTA_LABELS, LEAD_EVENT_LABELS } from "@/constants/leads";
import { formatDateTime } from "@/lib/format";
import type { LeadEventEntry } from "@/types/admin-leads";

function describe(event: LeadEventEntry): string {
  const action = event.details.action ? LEAD_CTA_LABELS[event.details.action] ?? event.details.action : null;
  return [LEAD_EVENT_LABELS[event.type], action ? `(${action})` : null, event.productName].filter(Boolean).join(" ");
}

/** What the customer did in the shop, newest first. */
export function LeadActivity({ events }: { events: LeadEventEntry[] }) {
  if (!events.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="border-l-2 border-border pl-3">
          <p className="text-sm">{describe(event)}</p>
          {event.details.note ? <p className="text-sm text-muted-foreground">“{event.details.note}”</p> : null}
          <p className="text-xs text-muted-foreground">{formatDateTime(event.occurredAt)}</p>
        </li>
      ))}
    </ol>
  );
}
