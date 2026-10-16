/**
 * Map DB catalogue rows → shop Product / Category shapes used by UI.
 */
import { CATEGORIES as SEED_CATEGORIES } from "@/data/catalogue/seed-data";
import type {
  Brand,
  Category,
  Colour,
  Product,
  SizeOption,
  StockStatus,
  SubCategory,
  Variant,
} from "@/types";
import type {
  Category as DbCategory,
  MattressBrand as DbBrand,
  Option as DbOption,
  Product as DbProduct,
  ProductVariant as DbVariant,
  SizeDimension as DbDim,
} from "@/db/schema";

const COVER_BY_SLUG = Object.fromEntries(
  SEED_CATEGORIES.map((c) => [c.slug, c.coverImage]),
);

function subCategoriesFor(slug: string): SubCategory[] {
  if (slug === "mattresses") {
    return [
      { id: "sc-ortho", name: "Orthopaedic", slug: "ortho" },
      { id: "sc-foam", name: "Foam", slug: "foam" },
      { id: "sc-spring", name: "Spring", slug: "spring" },
    ];
  }
  if (slug === "cots") {
    return [
      { id: "sc-single", name: "Single", slug: "single" },
      { id: "sc-queen", name: "Queen", slug: "queen" },
      { id: "sc-king", name: "King", slug: "king" },
      { id: "sc-storage", name: "Storage", slug: "storage" },
    ];
  }
  if (slug === "sofas") {
    return [
      { id: "sc-2s", name: "2-Seater", slug: "2-seater" },
      { id: "sc-3s", name: "3-Seater", slug: "3-seater" },
      { id: "sc-l", name: "L-Shape", slug: "l-shape" },
    ];
  }
  return [
    { id: "sc-ct", name: "Computer", slug: "computer" },
    { id: "sc-study", name: "Study", slug: "study" },
    { id: "sc-ldesk", name: "L-Desk", slug: "l-desk" },
  ];
}

export function mapCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    coverImage: COVER_BY_SLUG[row.slug] ?? "/images/mattresses/cover.jpg",
    order: row.sortOrder,
    visible: row.isActive,
    templateId: `tpl-${row.slug}`,
    subCategories: subCategoriesFor(row.slug),
  };
}

export function mapBrand(row: DbBrand): Brand {
  return { id: row.id, name: row.name };
}

export function mapColour(row: DbOption): Colour {
  return {
    id: row.id,
    name: row.label,
    hex: row.hex ?? "#CCCCCC",
  };
}

export function mapSize(
  dim: DbDim,
  sizeGroupLabel: string,
): SizeOption {
  return {
    id: dim.id,
    group: sizeGroupLabel,
    label: dim.label,
    lengthIn: dim.lengthIn,
    widthIn: dim.widthIn,
  };
}

function stockStatus(qty: number, isCustom: boolean): StockStatus {
  if (isCustom) return "made_to_order";
  if (qty <= 0) return "out_of_stock";
  if (qty <= 2) return "low_stock";
  return "in_stock";
}

export type OptionLookup = Map<string, DbOption>;

export function mapVariant(
  row: DbVariant,
  opts: OptionLookup,
  imageUrl: string | null,
  dimLabelById?: Map<string, string>,
): Variant {
  const colour = row.colourOptionId ? opts.get(row.colourOptionId) : undefined;
  const sizeGroup = opts.get(row.sizeGroupOptionId);
  const thickness = row.thicknessOptionId
    ? opts.get(row.thicknessOptionId)
    : undefined;
  const mrp = Number(row.mrp);
  const price = Number(row.price);
  const discount =
    mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return {
    id: row.id,
    sku: row.sku,
    sizeGroupOptionId: row.sizeGroupOptionId,
    sizeGroupLabel: sizeGroup?.label ?? "Size",
    sizeGroupSlug: sizeGroup?.slug ?? "",
    sizeDimensionId: row.sizeDimensionId,
    sizeDimensionLabel: row.sizeDimensionId
      ? (dimLabelById?.get(row.sizeDimensionId) ?? null)
      : null,
    isCustomSize: row.isCustomSize,
    thicknessOptionId: row.thicknessOptionId,
    thicknessLabel: thickness?.label ?? null,
    colourId: row.colourOptionId ?? "",
    colourName: colour?.label,
    colourHex: colour?.hex ?? undefined,
    sizeId: row.sizeDimensionId ?? undefined,
    mrp,
    price,
    maxDiscountPercent: Math.max(discount, 0),
    stockQty: row.stockQty,
    stockStatus: stockStatus(row.stockQty, row.isCustomSize),
    images: imageUrl ? [imageUrl] : [],
    madeToOrderDays: row.isCustomSize ? [7, 14] : undefined,
  };
}

function mattressSubCategory(purposeSlug: string | undefined): string {
  return purposeSlug === "pain-relief" ? "sc-ortho" : "sc-foam";
}

/** Fallback only — real collection UUID hydrated from product_collections. */
function collectionFor(categorySlug: string, featured: boolean): string {
  if (featured && (categorySlug === "cots" || categorySlug === "sofas")) {
    return "royal-range";
  }
  return "";
}

export function mapProduct(
  row: DbProduct,
  variants: DbVariant[],
  opts: OptionLookup,
  categorySlug: string,
  dimLabelById: Map<string, string> = new Map(),
): Product {
  const purpose = row.purposeOptionId
    ? opts.get(row.purposeOptionId)
    : undefined;
  const cover = row.coverMaterialOptionId
    ? opts.get(row.coverMaterialOptionId)
    : undefined;
  const filling = row.fillingOptionId
    ? opts.get(row.fillingOptionId)
    : undefined;
  const comfort = row.comfortOptionId
    ? opts.get(row.comfortOptionId)
    : undefined;

  const specs: Record<string, string | number | boolean> = {};
  if (purpose) specs.purpose = purpose.label;
  if (cover) specs.cover = cover.label;
  if (filling) specs.filling = filling.label;
  if (comfort) specs.comfort = comfort.label;

  const highlights = [
    purpose?.label,
    comfort ? `${comfort.label} feel` : undefined,
    cover ? `${cover.label} cover` : undefined,
    filling ? `${filling.label} fill` : undefined,
  ].filter(Boolean) as string[];

  // Same product image on every SKU bloats RSC payloads (mattresses ≈ 480 SKUs).
  // Keep the image on the first SKU only; PDP falls back for gallery.
  const active = variants.filter((v) => v.isActive);
  const mappedVariants = active.map((v, i) =>
    mapVariant(
      v,
      opts,
      i === 0 || active.length <= 8 ? row.imageUrl : null,
      dimLabelById,
    ),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.categoryId,
    subCategoryId:
      categorySlug === "mattresses"
        ? mattressSubCategory(purpose?.slug)
        : "sc-queen",
    collectionId: collectionFor(categorySlug, row.isFeatured),
    mattressBrandId: row.mattressBrandId,
    highlights: highlights.length ? highlights : ["Showroom exclusive"],
    description: row.description ?? row.name,
    dimensions: { lIn: 78, wIn: 60, hIn: 6 },
    material: filling?.label ?? "House-made",
    finish: cover?.label ?? "Standard",
    warrantyYears: categorySlug === "mattresses" ? 5 : 2,
    warrantyExclusions: "Misuse, stains, water damage",
    assembly: categorySlug === "mattresses" ? "none" : "carpenter",
    deliveryDays: "2–12 days within Hyderabad",
    care: "Follow care guidance at the showroom.",
    specs,
    tags: [categorySlug, purpose?.slug ?? "house-made"].filter(Boolean),
    featured: row.isFeatured,
    popularity: 100 - row.sortOrder,
    status: row.status,
    variants: mappedVariants,
    relatedIds: [],
    completeRoomIds: [],
    createdAt: row.createdAt.toISOString().slice(0, 10),
  };
}
