import { getCategoryCoverImage, getShopCategoryName } from "@/constants/categories";
import { toRupees, toRupeesOrNull } from "@/lib/money";
import type { CategoryRow, CollectionRow, ProductVariantRow, QualityRow } from "@/types/db";
import type {
  CardVariant,
  CategoryItem,
  CollectionItem,
  ColourItem,
  QualityItem,
  VariantOption,
} from "@/types/catalogue";

export function toCategoryItem(row: Pick<CategoryRow, "id" | "name" | "slug">): CategoryItem {
  return {
    id: row.id,
    name: getShopCategoryName(row.slug, row.name),
    slug: row.slug,
    coverImage: getCategoryCoverImage(row.slug),
  };
}

export function toQualityItem(row: Pick<QualityRow, "id" | "name" | "slug" | "description" | "warrantyYears">): QualityItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    warrantyYears: row.warrantyYears,
  };
}

export function toCollectionItem(row: CollectionRow): CollectionItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    isFeatured: row.isFeatured,
  };
}

export function toCardVariant(
  row: Pick<ProductVariantRow, "qualityId" | "sizeLabel" | "colourId" | "mrp" | "price">,
): CardVariant {
  return {
    qualityId: row.qualityId,
    sizeLabel: row.sizeLabel,
    colourId: row.colourId,
    mrp: toRupeesOrNull(row.mrp),
    price: toRupees(row.price),
  };
}

export function toVariantOption(row: ProductVariantRow): VariantOption {
  return {
    id: row.id,
    sku: row.sku,
    sizeLabel: row.sizeLabel,
    lengthIn: row.lengthIn,
    widthIn: row.widthIn,
    thicknessIn: row.thicknessIn,
    seats: row.seats,
    qualityId: row.qualityId,
    colourId: row.colourId,
    mrp: toRupeesOrNull(row.mrp),
    price: toRupees(row.price),
  };
}

/** Distinct colours in first-seen order. */
export function uniqueColours(colours: (ColourItem | null)[]): ColourItem[] {
  const byId = new Map<string, ColourItem>();
  for (const colour of colours) {
    if (colour && !byId.has(colour.id)) byId.set(colour.id, colour);
  }
  return [...byId.values()];
}
