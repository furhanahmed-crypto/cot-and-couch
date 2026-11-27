/** Category slugs used in code. The only place these strings may appear. */
export const CATEGORY_SLUGS = {
  mattresses: "mattresses",
  cots: "cots",
  sofas: "sofas",
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];

/** Admin and DB say "Cots"; the shop says "Beds". */
const SHOP_CATEGORY_NAMES: Record<string, string> = {
  [CATEGORY_SLUGS.cots]: "Beds",
};

export function getShopCategoryName(slug: string, name: string): string {
  return SHOP_CATEGORY_NAMES[slug] ?? name;
}

export function getCategoryCoverImage(slug: string): string {
  return `/images/${slug}/cover.jpg`;
}

/** Which variant fields a category uses in the admin. Unknown categories get all of them. */
export type VariantFields = { dimensions: boolean; thickness: boolean; seats: boolean; colour: boolean };

const ALL_VARIANT_FIELDS: VariantFields = { dimensions: true, thickness: true, seats: true, colour: true };

const VARIANT_FIELDS: Record<string, VariantFields> = {
  [CATEGORY_SLUGS.mattresses]: { dimensions: true, thickness: true, seats: false, colour: false },
  [CATEGORY_SLUGS.cots]: { dimensions: true, thickness: false, seats: false, colour: true },
  [CATEGORY_SLUGS.sofas]: { dimensions: false, thickness: false, seats: true, colour: false },
};

export function getVariantFields(categorySlug: string): VariantFields {
  return VARIANT_FIELDS[categorySlug] ?? ALL_VARIANT_FIELDS;
}

/** Sofas have add-ons per product; cots have them per category. */
export function hasProductAddons(categorySlug: string): boolean {
  return categorySlug === CATEGORY_SLUGS.sofas;
}

/** The size chips' title on the product page. The sofa price list calls it "Model". */
export function getSizeAxisLabel(categorySlug: string): string {
  return categorySlug === CATEGORY_SLUGS.sofas ? "Model" : "Size";
}

/** Notes printed on the client's price list, shown on that category's product pages. */
const CATEGORY_NOTES: Record<string, string[]> = {
  // Source: docs/pricelist/sofa-pricelist (footer of the client's sofa sheet).
  [CATEGORY_SLUGS.sofas]: [
    "Any design and any customisation in size, fabric or design pattern will be manufactured.",
    "Sofas are manufactured fresh, on order. Delivery takes 3 to 10 days depending on the model.",
    "Prices vary for modern designs / premium fabrics selected.",
  ],
};

export function getCategoryNotes(categorySlug: string): string[] {
  return CATEGORY_NOTES[categorySlug] ?? [];
}
