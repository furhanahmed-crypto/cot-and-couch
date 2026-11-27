"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { saveProductImages, saveProductSpecs } from "@/services/products/content-mutations";
import type { ActionResult } from "@/types/action";
import { productImagesSchema, productSpecsSchema, type ProductImagesInput, type ProductSpecsInput } from "@/validation/products";

function refresh() {
  revalidatePath(ROUTES.admin.products, "layout");
  revalidateShopCache();
}

export async function saveProductImagesAction(input: ProductImagesInput): Promise<ActionResult> {
  const parsed = productImagesSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await saveProductImages(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the images");
  }
  refresh();
  return actionOk();
}

export async function saveProductSpecsAction(input: ProductSpecsInput): Promise<ActionResult> {
  const parsed = productSpecsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await saveProductSpecs(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the specs");
  }
  refresh();
  return actionOk();
}
