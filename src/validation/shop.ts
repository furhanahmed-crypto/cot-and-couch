import { z } from "zod";
import { idSchema } from "./common";

export { idSchema };

export const CUSTOM_SIZE_MIN_IN = 24;
export const CUSTOM_SIZE_MAX_IN = 96;
export const CART_QUANTITY_MAX = 20;
const NOTE_MAX_LENGTH = 500;

const customInchesSchema = z.coerce
  .number({ error: "Enter a size in inches" })
  .int({ error: "Use whole inches" })
  .min(CUSTOM_SIZE_MIN_IN, { error: `Size must be ${CUSTOM_SIZE_MIN_IN}–${CUSTOM_SIZE_MAX_IN} inches` })
  .max(CUSTOM_SIZE_MAX_IN, { error: `Size must be ${CUSTOM_SIZE_MIN_IN}–${CUSTOM_SIZE_MAX_IN} inches` });

/** Both custom sides, or neither. */
export const addToCartSchema = z
  .object({
    variantId: idSchema,
    addonIds: z.array(idSchema).max(20).default([]),
    customLengthIn: customInchesSchema.nullable().default(null),
    customWidthIn: customInchesSchema.nullable().default(null),
  })
  .refine((input) => (input.customLengthIn === null) === (input.customWidthIn === null), {
    error: "Enter both length and width for a custom size",
  });
export type AddToCartInput = z.input<typeof addToCartSchema>;

export const cartQuantitySchema = z.object({
  cartItemId: idSchema,
  quantity: z.coerce
    .number()
    .int()
    .min(1, { error: "Quantity must be at least 1" })
    .max(CART_QUANTITY_MAX, { error: `Quantity can be at most ${CART_QUANTITY_MAX}` }),
});

export const shortlistSchema = z.object({ productId: idSchema, isShortlisted: z.boolean() });

export const CTA_ACTIONS = ["whatsapp", "call", "visit", "callback", "maps"] as const;
export const ctaSchema = z.object({
  action: z.enum(CTA_ACTIONS),
  productId: idSchema.nullable().default(null),
  note: z.string().trim().max(NOTE_MAX_LENGTH).default(""),
});
export type CtaInput = z.input<typeof ctaSchema>;
