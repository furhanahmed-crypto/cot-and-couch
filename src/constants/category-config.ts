/**
 * Admin-editable option groups per furniture category (Figma category templates).
 * Keys live in `option_groups.key`; values in `options`.
 * DB category slug `cots` = Beds in the design.
 */

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

export const CATEGORY_CONFIGS: CategoryConfigDef[] = [
  {
    slug: "cots",
    title: "Beds",
    subtitle: "King · Queen · Single · Diwan · Storage · Hydraulic · Poster",
    variants: ["Size", "Finish"],
    groups: [
      {
        key: "cot_storage_type",
        label: "Storage type",
        seed: ["None", "Drawer", "Box", "Hydraulic"],
      },
      {
        key: "cot_headboard",
        label: "Headboard",
        seed: ["Wooden", "Upholstered", "Carved", "Softback", "None"],
      },
      {
        key: "cot_wood_type",
        label: "Wood type",
        seed: ["Teak", "Sheesham", "Engineered wood", "Solid wood mix"],
      },
      {
        key: "cot_polish_type",
        label: "Polish type",
        seed: ["Natural", "Melamine", "PU", "Wax"],
      },
      {
        key: "cot_mattress_size",
        label: "Recommended mattress size",
        seed: ["Single", "Diwan", "Queen", "King"],
      },
      {
        key: "cot_wood_grade",
        label: "Wood grade",
        seed: ["Standard", "Grade A", "Premium"],
      },
    ],
    textFields: [
      { key: "storage_capacity_l", label: "Storage capacity (L)" },
      { key: "headboard_height_in", label: "Headboard height (in)" },
      { key: "under_bed_clearance_in", label: "Under-bed clearance (in)" },
    ],
    siteFilters: [
      "Size",
      "Storage type",
      "Headboard",
      "Wood type",
      "Price",
      "Discount",
      "Colour",
      "Collection",
      "Availability",
    ],
  },
  {
    slug: "sofas",
    title: "Sofas",
    subtitle: "3 / 2 / 1-seater · Sets · L-shape · Sofa-cum-bed · Recliners · Wooden",
    variants: ["Configuration", "Fabric colour"],
    note: "Fabric colours come from the colour master (Masters), not a flat swatch.",
    groups: [
      {
        key: "sofa_seating_capacity",
        label: "Seating capacity",
        seed: ["1", "2", "3", "4", "5+"],
      },
      {
        key: "sofa_configuration",
        label: "Configuration",
        seed: [
          "1-seater",
          "2-seater",
          "3-seater",
          "L-shape",
          "Sofa-cum-bed",
          "Recliner",
          "Set",
        ],
      },
      {
        key: "sofa_upholstery",
        label: "Upholstery",
        seed: ["Fabric", "Leatherette", "Genuine leather"],
      },
      {
        key: "sofa_frame_wood",
        label: "Frame wood",
        seed: ["Teak", "Hardwood", "Plywood", "Metal"],
      },
      {
        key: "sofa_foam_density",
        label: "Foam density",
        seed: ["Soft", "Medium", "High density"],
      },
      {
        key: "sofa_seating_mechanism",
        label: "Seating mechanism",
        seed: ["Fixed", "Recliner", "Pull-out"],
      },
      {
        key: "sofa_seat_height",
        label: "Seat height",
        seed: ["16 in", "17 in", "18 in", "19 in", "20 in"],
      },
      {
        key: "sofa_seat_depth",
        label: "Seat depth",
        seed: ["20 in", "22 in", "24 in", "26 in"],
      },
      {
        key: "sofa_cushion_type",
        label: "Cushion type",
        seed: ["Foam", "Feather", "Fibre"],
      },
      {
        key: "sofa_firmness",
        label: "Firmness",
        seed: ["Soft", "Medium", "Firm"],
      },
      {
        key: "sofa_legs",
        label: "Legs",
        seed: ["Wooden", "Metal", "Hidden"],
      },
    ],
    textFields: [{ key: "set_contents", label: "Set contents (for sets)" }],
    siteFilters: [
      "Seating capacity",
      "Configuration",
      "Upholstery",
      "Frame",
      "Style",
      "Price",
      "Discount",
      "Colour",
      "Collection",
      "Availability",
    ],
  },
  {
    slug: "computer-tables",
    title: "Computer tables",
    subtitle: "Computer · Study · L-shape desks · Office",
    variants: ["Width", "Finish"],
    groups: [
      {
        key: "desk_shape",
        label: "Shape",
        seed: ["Straight", "L-shape", "Corner"],
      },
      {
        key: "desk_top_size",
        label: "Top size",
        seed: ["Compact", "Medium", "Large"],
      },
      {
        key: "desk_height",
        label: "Height",
        seed: ["Standard (30 in)", "Sit-stand"],
      },
      {
        key: "desk_load_capacity",
        label: "Load capacity (kg)",
        seed: ["20 kg", "40 kg", "60 kg+"],
      },
      {
        key: "desk_material",
        label: "Material",
        seed: ["Engineered wood", "Solid wood", "Metal + wood"],
      },
      {
        key: "desk_keyboard_tray",
        label: "Keyboard tray",
        seed: ["Yes", "No"],
      },
      {
        key: "desk_width_band",
        label: "Width band",
        seed: ["Under 100 cm", "100–140 cm", "140 cm+"],
      },
      {
        key: "desk_cpu_bay",
        label: "CPU / UPS bay",
        seed: ["Yes", "No"],
      },
      {
        key: "desk_drawers",
        label: "Drawers",
        seed: ["None", "1", "2", "3+"],
      },
      {
        key: "desk_shelves",
        label: "Shelves",
        seed: ["None", "1", "2+"],
      },
      {
        key: "desk_cable_management",
        label: "Cable management",
        seed: ["Yes", "No"],
      },
    ],
    textFields: [],
    siteFilters: [
      "Shape",
      "Width band",
      "Material",
      "Keyboard tray",
      "Storage",
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
  const opts: { groupKey: string; label: string; slug: string; sortOrder: number }[] =
    [];
  let gi = 20;
  for (const cat of CATEGORY_CONFIGS) {
    for (const g of cat.groups) {
      groups.push({ key: g.key, label: g.label, sortOrder: gi++ });
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
  return { groups, opts };
}
