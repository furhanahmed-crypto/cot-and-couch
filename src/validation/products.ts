import { z } from "zod";
import { PRODUCT_STATUSES } from "@/constants/products";
import {
  idSchema,
  optionalCountSchema,
  optionalIdSchema,
  optionalInchesSchema,
  optionalMrpSchema,
  optionalTextSchema,
  priceSchema,
  requiredText,
  slugSchema,
} from "./common";

const MAX_IMAGES = 20;
const MAX_SPECS = 30;
const MAX_BULK_VARIANTS = 500;

export const productBasicsSchema = z.object({
  name: requiredText("Name"),
  /** Empty = made from the name. */
  slug: slugSchema.or(z.literal("")).default(""),
  categoryId: idSchema,
  brandId: optionalIdSchema,
  description: optionalTextSchema,
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  isFeatured: z.boolean().default(false),
  collectionIds: z.array(idSchema).max(50).default([]),
});
export type ProductBasicsInput = z.input<typeof productBasicsSchema>;

export const productStatusSchema = z.object({ productId: idSchema, status: z.enum(PRODUCT_STATUSES) });

const imageUrlSchema = z
  .string()
  .trim()
  .refine((url) => url.startsWith("/") || /^https:\/\//.test(url), { error: "Image URL must start with / or https://" });

export const productImagesSchema = z.object({
  productId: idSchema,
  images: z.array(z.object({ url: imageUrlSchema, alt: optionalTextSchema })).max(MAX_IMAGES),
});
export type ProductImagesInput = z.input<typeof productImagesSchema>;

export const productSpecsSchema = z.object({
  productId: idSchema,
  specs: z
    .array(z.object({ label: requiredText("Label", 60), value: requiredText("Value", 200) }))
    .max(MAX_SPECS)
    .refine((specs) => new Set(specs.map((spec) => spec.label.toLowerCase())).size === specs.length, {
      error: "Each spec label can be used once",
    }),
});
export type ProductSpecsInput = z.input<typeof productSpecsSchema>;

export const variantFormSchema = z
  .object({
    productId: idSchema,
    sizeLabel: requiredText("Size", 80),
    lengthIn: optionalInchesSchema,
    widthIn: optionalInchesSchema,
    thicknessIn: optionalInchesSchema,
    seats: optionalCountSchema,
    qualityId: optionalIdSchema,
    colourId: optionalIdSchema,
    mrp: optionalMrpSchema,
    price: priceSchema,
    isActive: z.boolean().default(true),
  })
  .refine((variant) => variant.mrp === null || variant.mrp >= variant.price, {
    error: "MRP cannot be lower than the price",
    path: ["mrp"],
  });
export type VariantFormInput = z.input<typeof variantFormSchema>;

/** "Add many": every size x quality x colour x thickness combination, one price for all. */
export const bulkVariantsSchema = z
  .object({
    productId: idSchema,
    sizes: z
      .array(z.object({ sizeLabel: requiredText("Size", 80), lengthIn: optionalInchesSchema, widthIn: optionalInchesSchema }))
      .min(1, { error: "Add at least one size" }),
    qualityIds: z.array(idSchema).default([]),
    colourIds: z.array(idSchema).default([]),
    thicknessIns: z.array(z.coerce.number().int().positive()).default([]),
    mrp: optionalMrpSchema,
    price: priceSchema,
  })
  .refine((input) => input.mrp === null || input.mrp >= input.price, { error: "MRP cannot be lower than the price", path: ["mrp"] })
  .refine(
    (input) =>
      input.sizes.length * Math.max(1, input.qualityIds.length) * Math.max(1, input.colourIds.length) * Math.max(1, input.thicknessIns.length) <=
      MAX_BULK_VARIANTS,
    { error: `At most ${MAX_BULK_VARIANTS} variants at once` },
  );
export type BulkVariantsInput = z.input<typeof bulkVariantsSchema>;

export const variantActiveSchema = z.object({ variantId: idSchema, isActive: z.boolean() });
