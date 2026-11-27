"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { createQuality, deleteQuality, updateCategory, updateQuality } from "@/services/categories/mutations";
import type { ActionResult } from "@/types/action";
import { categoryFormSchema, qualityFormSchema, type CategoryFormInput, type QualityFormInput } from "@/validation/catalogue";
import { idSchema } from "@/validation/common";

/** Category pages, product pages (they show qualities) and the shop. */
function refresh() {
  revalidatePath(ROUTES.admin.categories, "layout");
  revalidatePath(ROUTES.admin.products, "layout");
  revalidateShopCache();
}

export async function updateCategoryAction(id: string, input: CategoryFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await updateCategory(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the category");
  }
  refresh();
  return actionOk();
}

export async function createQualityAction(input: QualityFormInput): Promise<ActionResult> {
  const parsed = qualityFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await createQuality(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the quality");
  }
  refresh();
  return actionOk();
}

export async function updateQualityAction(id: string, input: QualityFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = qualityFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await updateQuality(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the quality");
  }
  refresh();
  return actionOk();
}

export async function deleteQualityAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteQuality(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the quality");
  }
  refresh();
  return actionOk();
}
