/**
 * Admin-editable option groups for live furniture categories.
 * Sofas / computer tables are deferred — add configs when those ship.
 * DB category slug `cots` = Beds in the shop UI.
 */
import {
  BED_WIDTH_GROUP_KEY,
  BED_WIDTH_OPTIONS,
} from "@/constants/bed-model";

export type CategoryConfigGroup = {
  key: string;
  label: string;
  /** Seed labels for first install / SQL */
  seed: string[];
};

export type CategoryConfigDef = {
  /** DB category slug */
  slug: string;
  /** Display name in admin */
  title: string;
  subtitle: string;
  variants: string[];
  note?: string;
  /** Dropdown-backed specs (required + optional choice fields) */
  groups: CategoryConfigGroup[];
  /** Free-text / number fields (not option masters) */
  textFields: { key: string; label: string; required?: boolean }[];
  siteFilters: string[];
};

/** Live category templates only (mattresses use brand sheets, not this list). */
export const CATEGORY_CONFIGS: CategoryConfigDef[] = [
  {
    slug: "cots",
    title: "Beds",
    subtitle:
      "Range masters · 2–3 products per range · shared widths · colour on variants",
    variants: ["Width", "Colour"],
    note: "Add products under Products and assign a bed range. Collections are optional tags.",
    groups: [
      {
        key: BED_WIDTH_GROUP_KEY,
        label: "Bed width (shared)",
        seed: BED_WIDTH_OPTIONS.map((w) => w.label),
      },
    ],
    textFields: [],
    siteFilters: [
      "Width",
      "Price",
      "Discount",
      "Colour",
      "Collection",
      "Availability",
    ],
  },
];

export function categoryConfigForSlug(slug: string) {
  return CATEGORY_CONFIGS.find((c) => c.slug === slug);
}

export function allCategoryConfigGroupKeys() {
  return CATEGORY_CONFIGS.flatMap((c) => c.groups.map((g) => g.key));
}

function slugifyLabel(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Flat seed rows for SQL / db:seed */
export function categoryConfigSeedRows() {
  const groups: { key: string; label: string; sortOrder: number }[] = [];
  const opts: {
    groupKey: string;
    label: string;
    slug: string;
    sortOrder: number;
    detail?: string;
  }[] = [];
  let gi = 20;
  for (const cat of CATEGORY_CONFIGS) {
    for (const g of cat.groups) {
      groups.push({ key: g.key, label: g.label, sortOrder: gi++ });
      if (g.key === BED_WIDTH_GROUP_KEY) {
        BED_WIDTH_OPTIONS.forEach((w, i) => {
          opts.push({
            groupKey: g.key,
            label: w.label,
            slug: w.slug,
            detail: w.detail,
            sortOrder: i + 1,
          });
        });
      } else {
        g.seed.forEach((label, i) => {
          opts.push({
            groupKey: g.key,
            label,
            slug: slugifyLabel(label),
            sortOrder: i + 1,
          });
        });
      }
    }
  }
  return { groups, opts };
}
