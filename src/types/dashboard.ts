import type { OrderStatus } from "@/constants/orders";

export const DASHBOARD_RANGES = ["7d", "30d"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export type DashboardStats = {
  openOrders: number;
  ordersInRange: number;
  newLeadsInRange: number;
  publishedProducts: number;
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
};

export type HotLead = {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  lastSeenAt: string;
};
