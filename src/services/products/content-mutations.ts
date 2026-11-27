import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { productImages, productSpecs } from "@/db/schema";
import type { productImagesSchema, productSpecsSchema } from "@/validation/products";

type ImagesData = z.output<typeof productImagesSchema>;
type SpecsData = z.output<typeof productSpecsSchema>;

/** Replaces all images in list order (the first is the cover), in one transaction. */
export async function saveProductImages({ productId, images }: ImagesData): Promise<void> {
  const clear = db.delete(productImages).where(eq(productImages.productId, productId));
  if (!images.length) {
    await clear;
    return;
  }
  const rows = images.map((image, index) => ({ productId, url: image.url, alt: image.alt, sortOrder: index + 1 }));
  await db.batch([clear, db.insert(productImages).values(rows)]);
}

/** Replaces all specs in list order, in one transaction. */
export async function saveProductSpecs({ productId, specs }: SpecsData): Promise<void> {
  const clear = db.delete(productSpecs).where(eq(productSpecs.productId, productId));
  if (!specs.length) {
    await clear;
    return;
  }
  const rows = specs.map((spec, index) => ({ productId, label: spec.label, value: spec.value, sortOrder: index + 1 }));
  await db.batch([clear, db.insert(productSpecs).values(rows)]);
}
