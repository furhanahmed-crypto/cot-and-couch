export const ORDER_STATUSES = [
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "closed",
  "issue",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
