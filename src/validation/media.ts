import { z } from "zod";
import { idSchema, imageUrlSchema, optionalIdSchema, optionalTextSchema, optionalUrlSchema, requiredText } from "./common";

const MAX_TAGS = 20;

/** "mattresses, wake-fit" -> ["mattresses", "wake-fit"]: lower case, no blanks or repeats. */
const tagsSchema = z
  .string()
  .default("")
  .transform((text) => [...new Set(text.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))])
  .refine((tags) => tags.length <= MAX_TAGS, { error: `At most ${MAX_TAGS} tags` });

export const galleryFormSchema = z.object({
  imageUrl: imageUrlSchema,
  title: optionalTextSchema,
  area: optionalTextSchema,
  deliveryMonth: optionalTextSchema,
  productId: optionalIdSchema,
  isPublished: z.boolean(),
});
export type GalleryFormInput = z.input<typeof galleryFormSchema>;

export const reelFormSchema = z.object({
  title: requiredText("Title"),
  imageUrl: imageUrlSchema,
  videoUrl: z.string().trim().pipe(z.url({ protocol: /^https$/, error: "Enter a video link starting with https://" }).max(2000)),
  instagramUrl: optionalUrlSchema,
  tags: tagsSchema,
  isPublished: z.boolean(),
});
export type ReelFormInput = z.input<typeof reelFormSchema>;

export const mediaMoveSchema = z.object({ id: idSchema, direction: z.enum(["up", "down"]) });
export const mediaPublishSchema = z.object({ id: idSchema, isPublished: z.boolean() });
