/**
 * Build shop-facing Product[] from catalogue seed-data (matches DB DTO shape).
 */
import {
  MATTRESS_BRANDS,
  CATEGORIES,
  COLOURS,
  COMFORTS,
  COT_MODELS,
  COT_VARIANT_PLANS,
  COVER_MATERIALS,
  FILLINGS,
  MATTRESS_MODELS,
  PURPOSES,
  SIZE_DIMENSIONS,
  SIZE_GROUPS,
  SOFA_MODELS,
  SOFA_VARIANT_PRICE,
  TABLE_MODELS,
  TABLE_VARIANT_PRICE,
  THICKNESSES,
  MATTRESS_SIZE_SKUS,
  MATTRESS_THICKNESS_SKUS,
  houseImagePath,
  houseProductSlug,
  mattressImagePath,
  mattressPrice,
  productSlug,
} from "@/data/catalogue/seed-data";
import type { Brand, Category, Colour, Product, SizeOption, Variant } from "@/types";

export const dtoMattressBrands: Brand[] = MATTRESS_BRANDS.map((b) => ({
  id: `mattress-brand-${b.slug}`,
  name: b.name,
}));

export const dtoColours: Colour[] = COLOURS.map((c) => ({
  id: `colour-${c.slug}`,
  name: c.label,
  hex: c.hex,
}));

export const dtoSizes: SizeOption[] = Object.entries(SIZE_DIMENSIONS).flatMap(
  ([group, pairs]) =>
    pairs.map(([lengthIn, widthIn]) => ({
      id: `size-${group}-${lengthIn}-${widthIn}`,
      group: SIZE_GROUPS.find((s) => s.slug === group)?.label ?? group,
      label: `${lengthIn} × ${widthIn}"`,
      lengthIn,
      widthIn,
    })),
);

export const dtoCategories: Category[] = CATEGORIES.map((c) => ({
  id: `cat-${c.slug}`,
  name: c.name,
  slug: c.slug,
  coverImage: c.coverImage,
  order: c.sortOrder,
  visible: true,
  templateId: `tpl-${c.slug}`,
  subCategories:
    c.slug === "mattresses"
      ? [
          { id: "sc-ortho", name: "Orthopaedic", slug: "ortho" },
          { id: "sc-foam", name: "Foam", slug: "foam" },
          { id: "sc-spring", name: "Spring", slug: "spring" },
        ]
      : c.slug === "cots"
        ? [
            { id: "sc-single", name: "Single", slug: "single" },
            { id: "sc-queen", name: "Queen", slug: "queen" },
            { id: "sc-king", name: "King", slug: "king" },
            { id: "sc-storage", name: "Storage", slug: "storage" },
          ]
        : c.slug === "sofas"
          ? [
              { id: "sc-2s", name: "2-Seater", slug: "2-seater" },
              { id: "sc-3s", name: "3-Seater", slug: "3-seater" },
              { id: "sc-l", name: "L-Shape", slug: "l-shape" },
            ]
          : [
              { id: "sc-ct", name: "Computer", slug: "computer" },
              { id: "sc-study", name: "Study", slug: "study" },
              { id: "sc-ldesk", name: "L-Desk", slug: "l-desk" },
            ],
}));

function purposeLabel(slug: string) {
  return PURPOSES.find((p) => p.slug === slug)?.label ?? slug;
}

/** Mock: size × thickness only (matches HTML product editor / DB seed). */
function mattressVariants(
  slug: string,
  brandSlug: string,
  modelKey: string,
  image: string,
  stockBase: number,
): Variant[] {
  const out: Variant[] = [];
  for (const sizePlan of MATTRESS_SIZE_SKUS) {
    const group = SIZE_GROUPS.find((s) => s.slug === sizePlan.size)!;
    const thickOpts = THICKNESSES.filter((t) =>
      (MATTRESS_THICKNESS_SKUS as readonly string[]).includes(t.slug),
    );
    for (const thick of thickOpts) {
      const thickKey = thick.slug as (typeof MATTRESS_THICKNESS_SKUS)[number];
      const priced = mattressPrice(sizePlan, thickKey);
      const dimId = `size-${sizePlan.size}-${sizePlan.lengthIn}-${sizePlan.widthIn}`;
      out.push({
        id: `var-${slug}-${sizePlan.size}-${sizePlan.lengthIn}x${sizePlan.widthIn}-${thickKey}`,
        sku: `${brandSlug.slice(0, 6)}-${modelKey.slice(0, 8)}-${sizePlan.size}-${sizePlan.lengthIn}x${sizePlan.widthIn}-${thickKey}`,
        sizeGroupOptionId: `sg-${sizePlan.size}`,
        sizeGroupLabel: group.label,
        sizeGroupSlug: sizePlan.size,
        sizeDimensionId: dimId,
        sizeDimensionLabel: `${sizePlan.lengthIn}x${sizePlan.widthIn} inch`,
        isCustomSize: false,
        thicknessOptionId: `thick-${thickKey}`,
        thicknessLabel: thick.label,
        colourId: "",
        sizeId: dimId,
        mrp: priced.mrp,
        price: priced.price,
        maxDiscountPercent: 25,
        stockQty: stockBase,
        stockStatus: "in_stock",
        images: [image],
      });
    }
  }
  return out;
}

export const dtoMattressProducts: Product[] = MATTRESS_BRANDS.flatMap((brand, bi) =>
  MATTRESS_MODELS.map((model, mi) => {
    const slug = productSlug(brand.slug, model.key);
    const image = mattressImagePath(brand.slug, model.key);
    const cover = COVER_MATERIALS.find((c) => c.slug === model.cover)!;
    const filling = FILLINGS.find((f) => f.slug === model.filling)!;
    const comfort = COMFORTS.find((c) => c.slug === model.comfort)!;

    return {
      id: `prod-${slug}`,
      slug,
      name: `${brand.name} ${model.name}`,
      categoryId: "cat-mattresses",
      subCategoryId: model.purpose === "pain-relief" ? "sc-ortho" : "sc-foam",
      collectionId: null,
      mattressBrandId: `mattress-brand-${brand.slug}`,
      purposeOptionId: null,
      coverMaterialOptionId: null,
      fillingOptionId: null,
      comfortOptionId: null,
      imageUrl: image,
      attributes: {},
      highlights: [
        purposeLabel(model.purpose),
        `${comfort.label} feel`,
        `${cover.label} cover`,
        `${filling.label} fill`,
      ],
      description: `${brand.name} ${model.name} — ${purposeLabel(model.purpose).toLowerCase()} mattress. Compare sizes and thickness in the showroom.`,
      dimensions: { lIn: 78, wIn: 60, hIn: 6, weightKg: 22 },
      material: filling.label,
      finish: cover.label,
      warrantyYears: 5,
      warrantyExclusions: "Misuse, stains, water damage",
      assembly: "none",
      deliveryDays: "2–7 days within Hyderabad",
      care: "Rotate seasonally. Spot-clean cover only.",
      specs: {
        purpose: purposeLabel(model.purpose),
        cover: cover.label,
        filling: filling.label,
        comfort: comfort.label,
      },
      tags: ["mattress", model.purpose, brand.slug],
      featured: mi === 0,
      popularity: 95 - bi * 5 - mi,
      status: "published",
      relatedIds: [],
      completeRoomIds: [],
      createdAt: "2026-10-01",
      variants: mattressVariants(slug, brand.slug, model.key, image, 6 + mi),
    } satisfies Product;
  }),
);

function cotSubCategory(specs: Record<string, string>) {
  if (specs.storage === "drawer" || specs.storage === "box" || specs.storage === "hydraulic") {
    return "sc-storage";
  }
  return "sc-queen";
}

export const dtoCotProducts: Product[] = COT_MODELS.map((model, mi) => {
  const slug = houseProductSlug("cots", model.key);
  const image = houseImagePath("cots", model.key);

  return {
    id: `prod-${slug}`,
    slug,
    name: model.name,
    categoryId: "cat-cots",
    subCategoryId: cotSubCategory(model.specs),
    collectionId:
      model.specs.headboard === "carved" ? "col-victoria" : null,
    mattressBrandId: null,
    purposeOptionId: null,
    coverMaterialOptionId: null,
    fillingOptionId: null,
    comfortOptionId: null,
    imageUrl: image,
    attributes: {},
    highlights: [
      model.specs.storage === "none" ? "Open base" : `${model.specs.storage} storage`,
      `${model.specs.headboard} headboard`,
      "House-made",
    ],
    description: model.description,
    dimensions: { lIn: 78, wIn: 60, hIn: 36, weightKg: 55 },
    material: "Teak / engineered wood",
    finish: model.specs.headboard,
    warrantyYears: 2,
    warrantyExclusions: "Misuse, stains, water damage",
    assembly: "carpenter",
    deliveryDays: "5–12 days within Hyderabad",
    care: "Dust with a soft cloth. Avoid harsh chemicals.",
    specs: model.specs,
    tags: ["cot", model.specs.storage],
    featured: mi === 0,
    popularity: 88 - mi,
    status: "published",
    relatedIds: [],
    completeRoomIds: [],
    createdAt: "2026-10-01",
    variants: COT_VARIANT_PLANS.flatMap((plan) => {
      const isCustom = plan.size === "custom";
      const dimId = isCustom
        ? null
        : `size-${plan.size}-${plan.lengthIn}-${plan.widthIn}`;
      return COLOURS.map((colour): Variant => ({
        id: `var-${slug}-${plan.size}-${colour.slug}`,
        sku: `cot-${model.key.slice(0, 12)}-${plan.size}-${isCustom ? "custom" : `${plan.lengthIn}x${plan.widthIn}`}-${colour.slug}`,
        sizeGroupOptionId: `sg-${plan.size}`,
        sizeGroupLabel:
          SIZE_GROUPS.find((s) => s.slug === plan.size)?.label ?? plan.size,
        sizeGroupSlug: plan.size,
        sizeDimensionId: dimId,
        sizeDimensionLabel:
          plan.lengthIn && plan.widthIn
            ? `${plan.lengthIn}x${plan.widthIn} inch`
            : null,
        isCustomSize: isCustom,
        thicknessOptionId: null,
        thicknessLabel: null,
        colourId: `colour-${colour.slug}`,
        colourName: colour.label,
        colourHex: colour.hex,
        sizeId: dimId ?? undefined,
        mrp: plan.mrp,
        price: plan.price,
        maxDiscountPercent: 25,
        stockQty: isCustom ? 0 : 4 + mi,
        stockStatus: isCustom ? "made_to_order" : "in_stock",
        images: [image],
        madeToOrderDays: isCustom ? [10, 18] : undefined,
      }));
    }),
  } satisfies Product;
});

function sofaSubCategory(seating: string) {
  if (seating === "2") return "sc-2s";
  if (seating === "L-shape") return "sc-l";
  return "sc-3s";
}

export const dtoSofaProducts: Product[] = SOFA_MODELS.map((model, mi) => {
  const slug = houseProductSlug("sofas", model.key);
  const image = houseImagePath("sofas", model.key);
  const seating = model.specs.seating;

  return {
    id: `prod-${slug}`,
    slug,
    name: model.name,
    categoryId: "cat-sofas",
    subCategoryId: sofaSubCategory(seating),
    collectionId: seating === "L-shape" ? "col-royal" : null,
    mattressBrandId: null,
    purposeOptionId: null,
    coverMaterialOptionId: null,
    fillingOptionId: null,
    comfortOptionId: null,
    imageUrl: image,
    attributes: {},
    highlights: [
      `${seating} seating`,
      `${model.specs.upholstery} upholstery`,
      `${model.specs.frame} frame`,
    ],
    description: model.description,
    dimensions: {
      lIn: seating === "L-shape" ? 108 : seating === "3" ? 84 : 60,
      wIn: 36,
      hIn: 34,
      weightKg: 50,
    },
    material: `${model.specs.upholstery} + ${model.specs.frame}`,
    finish: model.specs.upholstery,
    warrantyYears: 2,
    warrantyExclusions: "Misuse, stains, water damage",
    assembly: "pre_assembled",
    deliveryDays: "5–12 days within Hyderabad",
    care: "Vacuum fabric. Spot-clean only.",
    specs: model.specs,
    tags: ["sofa", model.specs.upholstery],
    featured: mi === 0,
    popularity: 82 - mi,
    status: "published",
    relatedIds: [],
    completeRoomIds: [],
    createdAt: "2026-10-01",
    variants: COLOURS.map((colour, vi): Variant => ({
      id: `var-${slug}-${colour.slug}-${vi}`,
      sku: `sofa-${model.key.slice(0, 14)}-${colour.slug}`,
      sizeGroupOptionId: "sg-custom",
      sizeGroupLabel: "Custom",
      sizeGroupSlug: "custom",
      sizeDimensionId: null,
      sizeDimensionLabel: null,
      isCustomSize: true,
      thicknessOptionId: null,
      thicknessLabel: null,
      colourId: `colour-${colour.slug}`,
      colourName: colour.label,
      colourHex: colour.hex,
      mrp: SOFA_VARIANT_PRICE.mrp + mi * 500,
      price: SOFA_VARIANT_PRICE.price + mi * 400,
      maxDiscountPercent: 25,
      stockQty: 3 + vi,
      stockStatus: "in_stock",
      images: [image],
    })),
  } satisfies Product;
});

function tableSubCategory(shape: string) {
  if (shape === "L") return "sc-ldesk";
  return "sc-ct";
}

export const dtoTableProducts: Product[] = TABLE_MODELS.map((model, mi) => {
  const slug = houseProductSlug("computer-tables", model.key);
  const image = houseImagePath("computer-tables", model.key);
  const shape = model.specs.shape;

  return {
    id: `prod-${slug}`,
    slug,
    name: model.name,
    categoryId: "cat-computer-tables",
    subCategoryId: tableSubCategory(shape),
    collectionId: null,
    mattressBrandId: null,
    purposeOptionId: null,
    coverMaterialOptionId: null,
    fillingOptionId: null,
    comfortOptionId: null,
    imageUrl: image,
    attributes: {},
    highlights: [
      `${shape} shape`,
      `${model.specs.widthBand} cm width`,
      model.specs.keyboardTray === "yes" ? "Keyboard tray" : "Clean top",
    ],
    description: model.description,
    dimensions: {
      lIn: shape === "L" ? 55 : 47,
      wIn: shape === "L" ? 47 : 24,
      hIn: 30,
      weightKg: 30,
    },
    material: "Engineered wood",
    finish: "Matte laminate",
    warrantyYears: 1,
    warrantyExclusions: "Misuse, stains, water damage",
    assembly: "carpenter",
    deliveryDays: "4–10 days within Hyderabad",
    care: "Dust with a soft cloth. Avoid harsh chemicals.",
    specs: model.specs,
    tags: ["desk", shape],
    featured: mi === 0,
    popularity: 70 - mi,
    status: "published",
    relatedIds: [],
    completeRoomIds: [],
    createdAt: "2026-10-01",
    variants: COLOURS.map((colour, vi): Variant => ({
      id: `var-${slug}-${colour.slug}-${vi}`,
      sku: `table-${model.key.slice(0, 14)}-${colour.slug}`,
      sizeGroupOptionId: "sg-custom",
      sizeGroupLabel: "Custom",
      sizeGroupSlug: "custom",
      sizeDimensionId: null,
      sizeDimensionLabel: null,
      isCustomSize: true,
      thicknessOptionId: null,
      thicknessLabel: null,
      colourId: `colour-${colour.slug}`,
      colourName: colour.label,
      colourHex: colour.hex,
      mrp: TABLE_VARIANT_PRICE.mrp + mi * 300,
      price: TABLE_VARIANT_PRICE.price + mi * 250,
      maxDiscountPercent: 25,
      stockQty: 5 + vi,
      stockStatus: "in_stock",
      images: [image],
    })),
  } satisfies Product;
});

/** All seed-aligned shop products (mattresses + house-made). */
export const dtoAllProducts: Product[] = [
  ...dtoMattressProducts,
  ...dtoCotProducts,
  ...dtoSofaProducts,
  ...dtoTableProducts,
];
