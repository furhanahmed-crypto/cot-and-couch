"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { createBrand, deleteBrand, updateBrand } from "@/services/categories/mutations";
import type { ActionResult } from "@/types/action";
import { brandFormSchema, type BrandFormInput } from "@/validation/catalogue";
import { idSchema } from "@/validation/common";

function refresh() {
  revalidatePath(ROUTES.admin.categories, "layout");
  revalidatePath(ROUTES.admin.products, "layout");
  revalidateShopCache();
}

export async function createBrandAction(input: BrandFormInput): Promise<ActionResult> {
  const parsed = brandFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await createBrand(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the brand");
  }
  refresh();
  return actionOk();
}

export async function updateBrandAction(id: string, input: BrandFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = brandFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await updateBrand(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the brand");
  }
  refresh();
  return actionOk();
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteBrand(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the brand");
  }
  refresh();
  return actionOk();
}
