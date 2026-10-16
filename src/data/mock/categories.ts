import type { AttributeTemplate, Category } from "@/types";

export const attributeTemplates: AttributeTemplate[] = [
  {
    id: "tpl-beds",
    categoryId: "cat-beds",
    name: "Beds template",
    fields: [
      { key: "size", label: "Size", type: "dropdown", filterable: true, options: ["King", "Queen", "Single", "Diwan"] },
      { key: "storage", label: "Storage", type: "dropdown", filterable: true, options: ["none", "box", "hydraulic", "drawer"] },
      { key: "headboard", label: "Headboard", type: "dropdown", filterable: true, options: ["wooden", "upholstered", "carved"] },
      { key: "woodGrade", label: "Wood grade", type: "text" },
      { key: "mattressSize", label: "Recommended mattress", type: "text" },
    ],
  },
  {
    id: "tpl-mattresses",
    categoryId: "cat-mattresses",
    name: "Mattresses template",
    fields: [
      { key: "size", label: "Size", type: "dropdown", filterable: true, options: ["King", "Queen", "Double", "Single"] },
      { key: "thickness", label: "Thickness", type: "dropdown", unit: "in", filterable: true, options: ["5", "6", "8", "10"] },
      { key: "firmness", label: "Firmness", type: "dropdown", filterable: true, options: ["soft", "medium", "medium-firm", "firm"] },
      { key: "type", label: "Type", type: "dropdown", filterable: true, options: ["memory foam", "pocket spring", "latex", "coir", "hybrid"] },
      { key: "trial", label: "Trial days", type: "number", unit: "days" },
    ],
  },
  {
    id: "tpl-sofas",
    categoryId: "cat-sofas",
    name: "Sofas template",
    fields: [
      { key: "seating", label: "Seating", type: "dropdown", filterable: true, options: ["1", "2", "3", "L-shape", "recliner"] },
      { key: "upholstery", label: "Upholstery", type: "dropdown", filterable: true, options: ["fabric", "leather", "leatherette", "velvet"] },
      { key: "frame", label: "Frame", type: "dropdown", filterable: true, options: ["teak", "sheesham", "engineered"] },
      { key: "foamDensity", label: "Foam density", type: "text" },
    ],
  },
  {
    id: "tpl-tables",
    categoryId: "cat-tables",
    name: "Computer tables template",
    fields: [
      { key: "shape", label: "Shape", type: "dropdown", filterable: true, options: ["straight", "L"] },
      { key: "widthBand", label: "Width", type: "dropdown", filterable: true, options: ["under 100", "100–120", "120+"] },
      { key: "keyboardTray", label: "Keyboard tray", type: "boolean", filterable: true },
      { key: "loadKg", label: "Load capacity", type: "number", unit: "kg" },
    ],
  },
];

export const categories: Category[] = [
  {
    id: "cat-beds",
    name: "Beds",
    slug: "beds",
    coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
    order: 1,
    visible: true,
    templateId: "tpl-beds",
    subCategories: [
      { id: "sc-king", name: "King", slug: "king" },
      { id: "sc-queen", name: "Queen", slug: "queen" },
      { id: "sc-single", name: "Single", slug: "single" },
      { id: "sc-storage", name: "Storage beds", slug: "storage" },
      { id: "sc-hydraulic", name: "Hydraulic beds", slug: "hydraulic" },
    ],
  },
  {
    id: "cat-mattresses",
    name: "Mattresses",
    slug: "mattresses",
    coverImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    order: 2,
    visible: true,
    templateId: "tpl-mattresses",
    subCategories: [
      { id: "sc-m-king", name: "King", slug: "king" },
      { id: "sc-m-queen", name: "Queen", slug: "queen" },
      { id: "sc-ortho", name: "Orthopaedic", slug: "orthopaedic" },
      { id: "sc-foam", name: "Foam", slug: "foam" },
      { id: "sc-spring", name: "Spring", slug: "spring" },
    ],
  },
  {
    id: "cat-sofas",
    name: "Sofas",
    slug: "sofas",
    coverImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    order: 3,
    visible: true,
    templateId: "tpl-sofas",
    subCategories: [
      { id: "sc-3s", name: "3-seater", slug: "3-seater" },
      { id: "sc-2s", name: "2-seater", slug: "2-seater" },
      { id: "sc-l", name: "L-shape", slug: "l-shape" },
      { id: "sc-cum", name: "Sofa-cum-bed", slug: "sofa-cum-bed" },
      { id: "sc-rec", name: "Recliners", slug: "recliners" },
    ],
  },
  {
    id: "cat-tables",
    name: "Computer Tables",
    slug: "computer-tables",
    coverImage: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&q=80",
    order: 4,
    visible: true,
    templateId: "tpl-tables",
    subCategories: [
      { id: "sc-ct", name: "Computer tables", slug: "computer" },
      { id: "sc-study", name: "Study tables", slug: "study" },
      { id: "sc-ldesk", name: "L-shape desks", slug: "l-shape" },
    ],
  },
];
