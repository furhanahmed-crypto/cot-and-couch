import { z } from "zod";
import { requiredText } from "./common";

/** "+91 98765 43210": shown as typed, but it must hold 10–12 digits. */
const storePhoneSchema = requiredText("Phone", 20).refine((text) => /^\+?[\d\s-]+$/.test(text) && /^\d{10,12}$/.test(text.replace(/\D/g, "")), {
  error: "Enter a phone number, e.g. +91 98765 43210",
});

/** wa.me needs the country code and digits only, e.g. 919876543210. */
const whatsappSchema = z
  .string({ error: "WhatsApp number is required" })
  .transform((text) => text.replace(/\D/g, ""))
  .refine((digits) => /^91\d{10}$/.test(digits), { error: "Enter 91 and the 10-digit number, e.g. 919876543210" });

export const storeSettingsSchema = z.object({
  name: requiredText("Store name"),
  address: requiredText("Address", 300),
  mapUrl: z.string().trim().pipe(z.url({ protocol: /^https$/, error: "Enter a map link starting with https://" }).max(2000)),
  timings: requiredText("Timings"),
  phone: storePhoneSchema,
  whatsapp: whatsappSchema,
  privacyNotice: requiredText("Privacy notice", 3000),
});
export type StoreSettingsInput = z.input<typeof storeSettingsSchema>;
