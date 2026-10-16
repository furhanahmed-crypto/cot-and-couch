/**
 * Lean catalogue DTOs — mirror DB tables.
 * Filters = option_groups + options (admin-editable).
 */

export type ProductStatus = "draft" | "published" | "archived";

export type OptionGroupKey =
  | "purpose"
  | "size_group"
  | "thickness"
  | "cover_material"
  | "filling"
  | "comfort"
  | "colour";

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type MattressBrandDto = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type OptionGroupDto = {
  id: string;
  key: OptionGroupKey;
  label: string;
  sortOrder: number;
};

export type OptionDto = {
  id: string;
  groupId: string;
  label: string;
  slug: string;
  hex: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type SizeDimensionDto = {
  id: string;
  sizeGroupOptionId: string;
  lengthIn: number;
  widthIn: number;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

/** Product model (mattress has mattressBrand + purpose/cover/filling/comfort). */
export type ProductDto = {
  id: string;
  categoryId: string;
  mattressBrandId: string | null;
  name: string;
  slug: string;
  description: string | null;
  purposeOptionId: string | null;
  coverMaterialOptionId: string | null;
  fillingOptionId: string | null;
  comfortOptionId: string | null;
  imageUrl: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  sortOrder: number;
};

/** Priced SKU. */
export type ProductVariantDto = {
  id: string;
  productId: string;
  sku: string;
  sizeGroupOptionId: string;
  sizeDimensionId: string | null;
  isCustomSize: boolean;
  thicknessOptionId: string | null;
  colourOptionId: string | null;
  mrp: string;
  price: string;
  stockQty: number;
  isActive: boolean;
};
