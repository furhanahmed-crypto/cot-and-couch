"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { bulkCreateVariants } from "@/services/products/bulk-variants";
import { createVariant, deleteVariant, setVariantActive, updateVariant } from "@/services/products/variant-mutations";
import type { ActionResult } from "@/types/action";
import { idSchema } from "@/validation/common";
import {
  bulkVariantsSchema,
  variantActiveSchema,
  variantFormSchema,
  type BulkVariantsInput,
  type VariantFormInput,
} from "@/validation/products";

function refresh() {
  revalidatePath(ROUTES.admin.products, "layout");
  revalidateShopCache();
}

export async function createVariantAction(input: VariantFormInput): Promise<ActionResult> {
  const parsed = variantFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await createVariant(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the variant");
  }
  refresh();
  return actionOk();
}

export async function updateVariantAction(id: string, input: VariantFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = variantFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await updateVariant(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the variant");
  }
  refresh();
  return actionOk();
}

export async function setVariantActiveAction(variantId: string, isActive: boolean): Promise<ActionResult> {
  const parsed = variantActiveSchema.safeParse({ variantId, isActive });
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await setVariantActive(parsed.data.variantId, parsed.data.isActive);
  } catch (error) {
    return toActionError(error, "Could not change the variant");
  }
  refresh();
  return actionOk();
}

/** Admin only, like deleting products. */
export async function deleteVariantAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteVariant(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the variant");
  }
  refresh();
  return actionOk();
}

export async function bulkCreateVariantsAction(input: BulkVariantsInput): Promise<ActionResult<{ created: number; skipped: number }>> {
  const parsed = bulkVariantsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    const result = await bulkCreateVariants(parsed.data);
    refresh();
    return actionOk(result);
  } catch (error) {
    return toActionError(error, "Could not add the variants");
  }
}
