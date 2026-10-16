import type { AttributeTemplate } from "@/types";
import { dtoCategories } from "./catalogue-from-dto";
import {
  COMFORTS,
  COVER_MATERIALS,
  FILLINGS,
  PURPOSES,
  SIZE_GROUPS,
  THICKNESSES,
} from "@/data/catalogue/seed-data";

export const categories = dtoCategories;

/** Filter fields for PLP — aligned with option_groups in DB. */
export const attributeTemplates: AttributeTemplate[] = [
  {
    id: "tpl-mattresses",
    categoryId: "cat-mattresses",
    name: "Mattresses filters",
    fields: [
      {
        key: "purpose",
        label: "Purpose",
        type: "dropdown",
        filterable: true,
        options: PURPOSES.map((p) => p.label),
      },
      {
        key: "size",
        label: "Size",
        type: "dropdown",
        filterable: true,
        options: SIZE_GROUPS.map((s) => s.label),
      },
      {
        key: "thickness",
        label: "Thickness",
        type: "dropdown",
        filterable: true,
        options: THICKNESSES.map((t) => t.label),
      },
      {
        key: "cover",
        label: "Cover material",
        type: "dropdown",
        filterable: true,
        options: COVER_MATERIALS.map((c) => c.label),
      },
      {
        key: "filling",
        label: "Filling",
        type: "dropdown",
        filterable: true,
        options: FILLINGS.map((f) => f.label),
      },
      {
        key: "comfort",
        label: "Comfort",
        type: "dropdown",
        filterable: true,
        options: COMFORTS.map((c) => c.label),
      },
    ],
  },
  {
    id: "tpl-cots",
    categoryId: "cat-cots",
    name: "Cots filters",
    fields: [
      {
        key: "size",
        label: "Size",
        type: "dropdown",
        filterable: true,
        options: SIZE_GROUPS.map((s) => s.label),
      },
      // Colour/finish comes from FilterPanel colour master — do not duplicate here.
    ],
  },
  {
    id: "tpl-sofas",
    categoryId: "cat-sofas",
    name: "Sofas filters",
    fields: [
      {
        key: "seating",
        label: "Seating",
        type: "dropdown",
        filterable: true,
        options: ["2", "3", "L-shape", "recliner"],
      },
    ],
  },
  {
    id: "tpl-computer-tables",
    categoryId: "cat-computer-tables",
    name: "Computer tables filters",
    fields: [
      {
        key: "shape",
        label: "Shape",
        type: "dropdown",
        filterable: true,
        options: ["straight", "L"],
      },
    ],
  },
];
