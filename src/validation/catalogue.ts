import { z } from "zod";
import { ADDON_KINDS, PRICE_UNITS } from "@/constants/products";
import {
  idSchema,
  optionalIdSchema,
  optionalTextSchema,
  priceSchema,
  requiredText,
  slugSchema,
  sortOrderSchema,
} from "./common";

export const colourFormSchema = z.object({
  name: requiredText("Name", 60),
  hex: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, { error: "Colour must look like #C19A6B" }),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema,
});
export type ColourFormInput = z.input<typeof colourFormSchema>;

export const collectionFormSchema = z.object({
  name: requiredText("Name"),
  slug: slugSchema.min(1, { error: "Slug is required" }),
  description: optionalTextSchema,
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema,
});
export type CollectionFormInput = z.input<typeof collectionFormSchema>;

/** Slug is not editable: code depends on the category slugs. */
export const categoryFormSchema = z.object({
  name: requiredText("Name", 60),
  isActive: z.boolean(),
  sortOrder: sortOrderSchema,
});
export type CategoryFormInput = z.input<typeof categoryFormSchema>;

export const qualityFormSchema = z.object({
  categoryId: idSchema,
  name: requiredText("Name", 80),
  description: optionalTextSchema,
  warrantyYears: z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.coerce.number().int().min(1, { error: "Warranty must be at least 1 year" }).max(50).nullable(),
  ),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema,
});
export type QualityFormInput = z.input<typeof qualityFormSchema>;

export const brandFormSchema = z.object({
  categoryId: idSchema,
  name: requiredText("Name", 80),
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema,
});
export type BrandFormInput = z.input<typeof brandFormSchema>;

/** productId null = for the whole category (cots); set = one product (sofas). */
export const addonFormSchema = z.object({
  categoryId: idSchema,
  productId: optionalIdSchema,
  name: requiredText("Name", 80),
  kind: z.enum(ADDON_KINDS).default("addon"),
  priceUnit: z.enum(PRICE_UNITS).default("fixed"),
  sizeLabel: optionalTextSchema,
  isActive: z.boolean().default(true),
  sortOrder: sortOrderSchema,
});
export type AddonFormInput = z.input<typeof addonFormSchema>;

/** The whole price grid: one cell per add-on x quality that has a price. Empty cells are not sent. */
export const addonPriceGridSchema = z.object({
  addonIds: z.array(idSchema).max(100),
  cells: z
    .array(z.object({ addonId: idSchema, qualityId: idSchema, price: priceSchema }))
    .max(2000),
});
export type AddonPriceGridInput = z.input<typeof addonPriceGridSchema>;
