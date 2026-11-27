export const ORDER_STATUSES = [
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "closed",
  "issue",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: "Confirmed",
  in_production: "In production",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  closed: "Closed",
  issue: "Needs attention",
};

/** Badge tone per status (see components/admin/common/status-badge.tsx). */
export const ORDER_STATUS_TONES = {
  confirmed: "outline",
  in_production: "accent",
  out_for_delivery: "accent",
  delivered: "strong",
  closed: "neutral",
  issue: "danger",
} as const satisfies Record<OrderStatus, string>;

/** Orders still in progress (not delivered or closed). */
export const OPEN_ORDER_STATUSES: OrderStatus[] = ["confirmed", "in_production", "out_for_delivery", "issue"];
