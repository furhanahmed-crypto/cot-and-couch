/** Category editor templates from HTML “Product fields by category” spec. */

export type TemplateField = { name: string; required?: boolean };

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
    name: "Beds",
    variants: ["Size", "Finish"],
    required: [
      "Size",
      "Storage type",
      "Headboard",
      "Wood type",
      "Polish type",
      "Recommended mattress size",
    ],
    optional: [
      "Wood grade",
      "Storage capacity (L)",
      "Headboard height (in)",
      "Under-bed clearance (in)",
    ],
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
  {
    slug: "sofas",
    name: "Sofas",
    variants: ["Configuration", "Fabric colour"],
    required: [
      "Seating capacity",
      "Configuration",
      "Upholstery",
      "Frame wood",
      "Foam density",
      "Seating mechanism",
      "Seat height",
      "Seat depth",
    ],
    optional: ["Cushion type", "Firmness", "Legs", "Set contents (for sets)"],
  },
  {
    slug: "computer-tables",
    name: "Computer tables",
    variants: ["Width", "Finish"],
    required: [
      "Shape",
      "Top size",
      "Height",
      "Load capacity (kg)",
      "Material",
      "Keyboard tray",
    ],
    optional: ["CPU / UPS bay", "Drawers", "Shelves", "Cable management"],
  },
  {
    slug: "dining",
    name: "Dining",
    variants: ["Seater", "Finish"],
    required: [
      "Seating capacity",
      "Top material",
      "Shape",
      "Table size",
      "Chair size",
      "Chair upholstery",
      "Set contents",
    ],
    optional: ["Wood type", "Bench option"],
  },
  {
    slug: "wardrobes",
    name: "Wardrobes",
    variants: ["Doors", "Finish"],
    required: ["Doors", "Material", "Mirror", "Shelves", "Hanging space", "Locker"],
    optional: ["Drawers", "Door type", "Loft unit"],
  },
  {
    slug: "tv-units",
    name: "TV units & others",
    variants: ["Size", "Finish"],
    note: "Shared lighter template for smaller furniture.",
    required: ["Item type", "Material", "Storage"],
    optional: ["Fits TV up to (in)", "Wall-mount option", "Cable management"],
  },
];

export function templateForCategorySlug(slug: string) {
  const key = slug.toLowerCase();
  return (
    CATEGORY_PRODUCT_TEMPLATES.find((t) => t.slug === key) ??
    CATEGORY_PRODUCT_TEMPLATES.find((t) => key.includes(t.slug.split("-")[0]!))
  );
}
