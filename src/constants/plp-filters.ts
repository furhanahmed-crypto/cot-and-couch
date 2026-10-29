import type { AttributeTemplate } from "@/types";
import {
  COMFORTS,
  COVER_MATERIALS,
  FILLINGS,
  PURPOSES,
  SIZE_GROUPS,
  THICKNESSES,
} from "@/data/catalogue/seed-data";
import { BED_WIDTH_OPTIONS } from "@/constants/bed-model";

/** PLP filter field templates for live categories only. */
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
    name: "Beds filters",
    fields: [
      {
        key: "width",
        label: "Width",
        type: "dropdown",
        filterable: true,
        options: BED_WIDTH_OPTIONS.map((w) => w.label),
      },
    ],
  },
];
