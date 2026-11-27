import type { OrderStatus } from "@/constants/orders";

export type StoreInfo = {
  name: string;
  address: string;
  mapUrl: string;
  timings: string;
  phone: string;
  whatsapp: string;
  privacyNotice: string;
};

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  area: string | null;
  deliveryMonth: string | null;
  productSlug: string | null;
  productName: string | null;
};

export type ReelItem = {
  id: string;
  title: string;
  coverUrl: string;
  videoUrl: string;
  instagramUrl: string | null;
};

export type OrderSummaryItem = {
  productName: string;
  sizeLabel: string;
  qualityName: string | null;
  colourName: string | null;
  quantity: number;
  lineTotal: number;
  addonNames: string[];
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  expectedDelivery: string | null;
  subtotal: number;
  advancePaid: number;
  items: OrderSummaryItem[];
};
