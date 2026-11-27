"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { createCollection, deleteCollection, updateCollection } from "@/services/collections/admin";
import type { ActionResult } from "@/types/action";
import { collectionFormSchema, type CollectionFormInput } from "@/validation/catalogue";
import { idSchema } from "@/validation/common";

function refresh() {
  revalidatePath(ROUTES.admin.collections);
  revalidateShopCache();
}

export async function createCollectionAction(input: CollectionFormInput): Promise<ActionResult> {
  const parsed = collectionFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await createCollection(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the collection");
  }
  refresh();
  return actionOk();
}

export async function updateCollectionAction(id: string, input: CollectionFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = collectionFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await updateCollection(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the collection");
  }
  refresh();
  return actionOk();
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteCollection(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the collection");
  }
  refresh();
  return actionOk();
}
