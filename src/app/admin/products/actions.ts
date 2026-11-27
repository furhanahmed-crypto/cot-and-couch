"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { createProduct, deleteProduct, setProductStatus, updateProductBasics } from "@/services/products/mutations";
import type { ActionResult } from "@/types/action";
import type { ProductStatus } from "@/constants/products";
import { idSchema } from "@/validation/common";
import { productBasicsSchema, productStatusSchema, type ProductBasicsInput } from "@/validation/products";

function refresh() {
  revalidatePath(ROUTES.admin.products, "layout");
  revalidatePath(ROUTES.admin.root);
  revalidateShopCache();
}

export async function createProductAction(input: ProductBasicsInput): Promise<ActionResult<{ id: string }>> {
  const parsed = productBasicsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    const { id } = await createProduct(parsed.data);
    refresh();
    return actionOk({ id });
  } catch (error) {
    return toActionError(error, "Could not add the product");
  }
}

export async function updateProductBasicsAction(id: string, input: ProductBasicsInput): Promise<ActionResult<{ slug: string }>> {
  const parsedId = idSchema.safeParse(id);
  const parsed = productBasicsSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    const result = await updateProductBasics(parsedId.data, parsed.data);
    refresh();
    return actionOk(result);
  } catch (error) {
    return toActionError(error, "Could not save the product");
  }
}

export async function setProductStatusAction(productId: string, status: ProductStatus): Promise<ActionResult> {
  const parsed = productStatusSchema.safeParse({ productId, status });
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await setProductStatus(parsed.data.productId, parsed.data.status);
  } catch (error) {
    return toActionError(error, "Could not change the status");
  }
  refresh();
  return actionOk();
}

/** Admin only: the team archives instead. */
export async function deleteProductAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteProduct(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the product");
  }
  refresh();
  return actionOk();
}
