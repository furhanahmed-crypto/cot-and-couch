/** Product editor field hints for live categories. */

export type CategoryProductTemplate = {
  slug: string;
  name: string;
  variants: string[];
  note?: string;
  required: string[];
  optional: string[];
};

export const CATEGORY_PRODUCT_TEMPLATES: CategoryProductTemplate[] = [
  {
    slug: "beds",
    name: "Cots",
    variants: ["Width", "Colour"],
    note: "Cot range products share width masters. Set prices per SKU in Variants.",
    required: ["Width"],
    optional: [],
  },
  {
    slug: "mattresses",
    name: "Mattresses",
    variants: ["Size (L × W)", "Thickness"],
    note: "No colour or finish. Photos are one set per product.",
    required: [
      "Brand",
      "Mattress type",
      "Firmness",
      "Layer construction",
      "Cover fabric",
      "Brand warranty (years)",
    ],
    optional: ["Removable cover", "Flippable", "Trial period (nights)", "Ideal for"],
  },
];

export function templateForCategorySlug(slug: string) {
  const key = slug.toLowerCase();
  if (key === "cots") {
    return CATEGORY_PRODUCT_TEMPLATES.find((t) => t.slug === "beds");
  }
  return CATEGORY_PRODUCT_TEMPLATES.find((t) => t.slug === key);
}

/** Stable attribute key for free-text template fields. */
export function templateFieldKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/** Mattress fields bound to Neon FKs / fixed attribute keys. */
export const MATTRESS_BOUND_FIELDS = {
  Brand: "mattressBrandId",
  "Mattress type": "purposeOptionId",
  Firmness: "comfortOptionId",
  "Layer construction": "fillingOptionId",
  "Cover fabric": "coverMaterialOptionId",
  "Brand warranty (years)": "warrantyYears",
} as const;

export const MATTRESS_OPTIONAL_ATTRS = {
  "Removable cover": "removableCover",
  Flippable: "flippable",
  "Trial period (nights)": "trialNights",
  "Ideal for": "idealFor",
} as const;
