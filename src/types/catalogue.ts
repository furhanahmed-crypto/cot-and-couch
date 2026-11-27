import type { AddonKind, PriceUnit } from "@/constants/products";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
};

export type ColourItem = { id: string; name: string; hex: string };

export type BrandItem = { id: string; name: string; slug: string };

export type QualityItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  warrantyYears: number | null;
};

export type CollectionItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isFeatured: boolean;
};

/** Just enough of a variant for list filters and "from" prices. */
export type CardVariant = {
  qualityId: string | null;
  sizeLabel: string;
  colourId: string | null;
  mrp: number | null;
  price: number;
};

export type ProductCardItem = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  brandId: string | null;
  brandName: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  /** Spec label -> value, e.g. { Comfort: "Firm" }. */
  specs: Record<string, string>;
  collectionIds: string[];
  colours: ColourItem[];
  variants: CardVariant[];
};

export type VariantOption = {
  id: string;
  sku: string;
  sizeLabel: string;
  lengthIn: number | null;
  widthIn: number | null;
  thicknessIn: number | null;
  seats: number | null;
  qualityId: string | null;
  colourId: string | null;
  mrp: number | null;
  price: number;
};

export type AddonOption = {
  id: string;
  name: string;
  kind: AddonKind;
  priceUnit: PriceUnit;
  /** Only offered for variants of this size. */
  sizeLabel: string | null;
  /** Price by quality id. No entry = not offered for that quality. */
  prices: Record<string, number>;
};

type ProductImage = { url: string; alt: string | null };
type ProductSpec = { label: string; value: string };

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categoryName: string;
  categorySlug: string;
  brandName: string | null;
  images: ProductImage[];
  specs: ProductSpec[];
  qualities: QualityItem[];
  colours: ColourItem[];
  variants: VariantOption[];
  addons: AddonOption[];
};
