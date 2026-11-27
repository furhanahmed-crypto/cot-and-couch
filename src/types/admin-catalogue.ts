import type { AddonKind, PriceUnit } from "@/constants/products";

export type ColourAdminRow = {
  id: string;
  name: string;
  hex: string;
  isActive: boolean;
  sortOrder: number;
  /** Products with a variant in this colour. */
  productCount: number;
};

export type CollectionAdminRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export type CategoryAdminRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export type QualityAdminRow = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  warrantyYears: number | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export type BrandAdminRow = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
};

export type AddonAdminRow = {
  id: string;
  categoryId: string;
  productId: string | null;
  name: string;
  kind: AddonKind;
  priceUnit: PriceUnit;
  sizeLabel: string | null;
  isActive: boolean;
  sortOrder: number;
  /** Price by quality id. No entry = not offered for that quality. */
  prices: Record<string, number>;
};

export type CategoryDetail = {
  category: CategoryAdminRow;
  qualities: QualityAdminRow[];
  brands: BrandAdminRow[];
  /** Add-ons for the whole category (not one product's). */
  addons: AddonAdminRow[];
  /** Size labels used by this category's variants, for "only for size". */
  sizeLabels: string[];
};
