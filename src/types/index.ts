export type StockStatus = "in_stock" | "low_stock" | "made_to_order" | "out_of_stock";
export type ProductStatus = "draft" | "published" | "archived";
export type IntentScore = "hot" | "warm" | "cold";
export type StaffRole = "admin" | "team";
export type OrderStatus =
  | "confirmed"
  | "in_production"
  | "out_for_delivery"
  | "delivered"
  | "closed"
  | "issue";

export interface Colour {
  id: string;
  name: string;
  hex: string;
  swatchUrl?: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
}

export interface SizeOption {
  id: string;
  group: string;
  label: string;
  lengthIn: number;
  widthIn: number;
}

export interface AttributeField {
  key: string;
  label: string;
  type: "text" | "number" | "dropdown" | "multi" | "boolean";
  unit?: string;
  filterable?: boolean;
  options?: string[];
}

export interface AttributeTemplate {
  id: string;
  categoryId: string;
  name: string;
  fields: AttributeField[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  order: number;
  visible: boolean;
  templateId: string;
  subCategories: SubCategory[];
}

export interface Variant {
  id: string;
  sku: string;
  /** Size group option id (Single / Diwan / Queen / King / Custom). */
  sizeGroupOptionId: string;
  sizeGroupLabel: string;
  sizeGroupSlug: string;
  /** Inch preset; null when custom size. */
  sizeDimensionId: string | null;
  sizeDimensionLabel: string | null;
  isCustomSize: boolean;
  thicknessOptionId: string | null;
  thicknessLabel: string | null;
  colourId: string;
  colourName?: string;
  colourHex?: string;
  /** @deprecated alias of sizeDimensionId for older call sites */
  sizeId?: string;
  mrp: number;
  price: number;
  maxDiscountPercent: number;
  stockQty: number;
  stockStatus: StockStatus;
  images: string[];
  videos?: string[];
  madeToOrderDays?: [number, number];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  subCategoryId: string;
  collectionId: string | null;
  mattressBrandId: string | null;
  bedRangeId: string | null;
  bedRangeName?: string | null;
  bedRangeSlug?: string | null;
  /** Beds only — drives cushion head/foot addon visibility. */
  cotType?: "non_cushion" | "cushion" | null;
  purposeOptionId: string | null;
  coverMaterialOptionId: string | null;
  fillingOptionId: string | null;
  comfortOptionId: string | null;
  imageUrl: string | null;
  /** Category template extras (warranty, wood type, etc.). */
  attributes: Record<string, string>;
  highlights: string[];
  description: string;
  dimensions: { lIn: number; wIn: number; hIn: number; weightKg?: number };
  material: string;
  finish: string;
  warrantyYears: number;
  warrantyExclusions: string;
  assembly: "pre_assembled" | "carpenter" | "none";
  deliveryDays: string;
  care: string;
  specs: Record<string, string | number | boolean>;
  tags: string[];
  featured: boolean;
  popularity: number;
  status: ProductStatus;
  variants: Variant[];
  relatedIds: string[];
  completeRoomIds: string[];
  createdAt: string;
}

/** Admin product editor option lookups. */
export interface ProductEditorLookups {
  brands: Brand[];
  /** Brand id → linked option ids (empty = all options available). */
  brandOptionIds: Record<string, string[]>;
  bedRanges: { id: string; name: string; slug: string }[];
  purpose: { id: string; label: string }[];
  coverMaterial: { id: string; label: string }[];
  filling: { id: string; label: string }[];
  comfort: { id: string; label: string }[];
  sizeGroups: { id: string; label: string; slug: string }[];
  thicknesses: { id: string; label: string; slug: string }[];
  colours: { id: string; label: string; slug: string }[];
  sizeDimensions: {
    id: string;
    sizeGroupOptionId: string;
    label: string;
    lengthIn: number;
    widthIn: number;
  }[];
  /** Beds — option masters keyed by option_groups.key */
  furnitureOptionsByKey: Record<string, { id: string; label: string }[]>;
}

export interface GalleryItem {
  id: string;
  image: string;
  productId: string;
  area: string;
  deliveryMonth: string;
  approved: boolean;
}

export interface Reel {
  id: string;
  title: string;
  cover: string;
  videoUrl: string;
  instagramUrl: string;
  tags: ("home" | string)[];
  order: number;
  active: boolean;
}

export interface StoreInfo {
  name: string;
  address: string;
  mapUrl: string;
  timings: string;
  phone: string;
  whatsapp: string;
  privacyNotice: string;
}

export interface CustomerSession {
  mobile: string;
  name: string;
  area?: string;
  whatsappOffers: boolean;
  loggedInAt: string;
}

export interface StaffSession {
  id: string;
  name: string;
  mobile: string;
  role: StaffRole;
}

export interface Lead {
  id: string;
  mobile: string;
  name: string;
  area?: string;
  firstSeen: string;
  lastSeen: string;
  intent: IntentScore;
  assignedTo?: string;
  whatsappOffers: boolean;
  viewedProductIds: string[];
  shortlistedIds: string[];
  ctaTaps: { type: string; productId?: string; at: string }[];
  followUpDone: boolean;
}

export interface SaleOrder {
  id: string;
  customerMobile: string;
  customerName: string;
  address: string;
  productId: string;
  variantId: string;
  quantity: number;
  agreedPrice: number;
  advancePaid: number;
  expectedDelivery: string;
  salesperson: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string; by: string; note?: string }[];
  deliveryPhoto?: string;
  notificationFailed?: boolean;
}

export interface AuditLog {
  id: string;
  at: string;
  user: string;
  action: string;
  detail: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface StaffUser {
  id: string;
  name: string;
  mobile: string;
  role: StaffRole;
  active: boolean;
}
