import { z } from "zod";

export const idSchema = z.uuid({ error: "Invalid id" });

/** Form text: trimmed; "" becomes null for optional fields. */
export const optionalTextSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((text) => text || null)
  .nullable()
  .default(null);

export function requiredText(label: string, max = 120) {
  return z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, { error: `${label} is required` })
    .max(max, { error: `${label} must be at most ${max} characters` });
}

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Slug: lowercase letters, numbers and dashes only" })
  .max(120);

/** "" or nothing -> null; otherwise a whole number > 0. */
function optionalPositiveInt(label: string) {
  return z.preprocess(
    (value) => (value === "" || value === undefined ? null : value),
    z.coerce.number().int({ error: `${label} must be a whole number` }).positive({ error: `${label} must be more than 0` }).nullable(),
  );
}

export const optionalInchesSchema = optionalPositiveInt("Size");
export const optionalCountSchema = optionalPositiveInt("Value");

/** Whole rupees, more than 0. */
export const priceSchema = z.coerce
  .number({ error: "Enter a price" })
  .int({ error: "Use whole rupees" })
  .positive({ error: "Price must be more than 0" });

/** Optional MRP: "" -> null. */
export const optionalMrpSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().int({ error: "Use whole rupees" }).positive({ error: "MRP must be more than 0" }).nullable(),
);

export const sortOrderSchema = z.coerce.number().int().min(0).max(9999).default(0);

/** "" or nothing -> null; otherwise an id. */
export const optionalIdSchema = z.preprocess((value) => (value === "" || value === undefined ? null : value), idSchema.nullable());

const INDIAN_MOBILE_LENGTH = 10;

/** 10-digit Indian mobile. Spaces and dashes are removed; stored as digits only. */
export const phoneSchema = z
  .string({ error: "Phone is required" })
  .transform((text) => text.replace(/\D/g, ""))
  .refine((digits) => digits.length === INDIAN_MOBILE_LENGTH, { error: "Enter a 10-digit mobile number" });

/** Whole rupees, 0 or more ("" -> 0). */
export const amountSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? 0 : value),
  z.coerce.number({ error: "Enter an amount" }).int({ error: "Use whole rupees" }).min(0, { error: "Amount cannot be negative" }),
);

/** "YYYY-MM-DD" from a date input; "" -> null. */
export const optionalDateSchema = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.iso.date({ error: "Enter a valid date" }).nullable(),
);

/** An http(s) link; "" -> null. */
export const optionalUrlSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() || null : value ?? null),
  z.url({ protocol: /^https?$/, error: "Enter a link starting with https://" }).max(2000).nullable(),
);
