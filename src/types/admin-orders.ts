import type { OrderStatus } from "@/constants/orders";
import type { PriceUnit } from "@/constants/products";

export const ORDER_DATE_RANGES = ["7d", "30d", "all"] as const;
type OrderDateRange = (typeof ORDER_DATE_RANGES)[number];

export type OrderAdminFilters = {
  q: string;
  status: OrderStatus | null;
  range: OrderDateRange;
  page: number;
};

export type OrderAdminRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  subtotal: number;
  advancePaid: number;
  status: OrderStatus;
  expectedDelivery: string | null;
  createdAt: string;
};

export type OrderDetailItem = {
  id: string;
  productName: string;
  sku: string;
  sizeLabel: string;
  qualityName: string | null;
  colourName: string | null;
  customLengthIn: number | null;
  customWidthIn: number | null;
  quantity: number;
  unitMrp: number | null;
  unitPrice: number;
  lineTotal: number;
  addons: { id: string; name: string; priceUnit: PriceUnit; price: number }[];
};

export type OrderHistoryEntry = {
  id: string;
  status: OrderStatus;
  note: string | null;
  changedByName: string | null;
  changedAt: string;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  hasAccount: boolean;
  salespersonName: string | null;
  subtotal: number;
  advancePaid: number;
  expectedDelivery: string | null;
  deliveryPhotoUrl: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderDetailItem[];
  history: OrderHistoryEntry[];
};

/** A customer account found by the "New order" search. */
export type CustomerMatch = {
  profileId: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
};

/** One variant the "Add item" dialog can pick, with the add-ons offered for it. */
export type OrderVariantOption = {
  id: string;
  label: string;
  sku: string;
  price: number;
  addons: { id: string; name: string; unitPrice: number }[];
};

/** One line in the "New order" form. `unitPrice` is for display; the server works out the real one. */
export type DraftOrderItem = {
  key: string;
  productName: string;
  variantId: string;
  variantLabel: string;
  quantity: number;
  addonIds: string[];
  addonNames: string[];
  customLengthIn: string;
  customWidthIn: string;
  unitPrice: number;
};
