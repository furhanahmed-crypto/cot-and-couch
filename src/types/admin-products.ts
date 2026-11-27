import type { ProductStatus } from "@/constants/products";
import type { AddonAdminRow, QualityAdminRow } from "@/types/admin-catalogue";

/** "order" = the shop order (`products.sort_order`), the default. */
export const PRODUCT_SORTS = ["order", "updated", "name", "price"] as const;
export type ProductAdminSort = (typeof PRODUCT_SORTS)[number];

export type ProductAdminFilters = {
  q: string;
  categoryId: string | null;
  status: ProductStatus | null;
  brandId: string | null;
  qualityId: string | null;
  sort: ProductAdminSort;
  page: number;
};

export type ProductAdminRow = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  brandName: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  variantCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  updatedAt: string;
};

export type OptionItem = { id: string; name: string };

export type ProductFilterOptions = {
  categories: OptionItem[];
  brands: OptionItem[];
  qualities: OptionItem[];
};

export type VariantAdminRow = {
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
  isActive: boolean;
};

/** Everything the product editor shows, in one load. */
export type ProductEditorData = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: ProductStatus;
    isFeatured: boolean;
    sortOrder: number;
    brandId: string | null;
    updatedAt: string;
  };
  category: { id: string; name: string; slug: string };
  brands: OptionItem[];
  qualities: QualityAdminRow[];
  colours: (OptionItem & { hex: string; isActive: boolean })[];
  collections: OptionItem[];
  collectionIds: string[];
  images: { url: string; alt: string | null }[];
  specs: { label: string; value: string }[];
  variants: VariantAdminRow[];
  addons: AddonAdminRow[];
  /** Products in an order cannot be deleted. */
  isOrdered: boolean;
};
