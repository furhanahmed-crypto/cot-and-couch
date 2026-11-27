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
