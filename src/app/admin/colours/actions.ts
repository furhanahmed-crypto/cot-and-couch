"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { createColour, deleteColour, updateColour } from "@/services/colours/mutations";
import type { ActionResult } from "@/types/action";
import { colourFormSchema, type ColourFormInput } from "@/validation/catalogue";
import { idSchema } from "@/validation/common";

function refresh() {
  revalidatePath(ROUTES.admin.colours);
  revalidateShopCache();
}

export async function createColourAction(input: ColourFormInput): Promise<ActionResult> {
  const parsed = colourFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await createColour(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the colour");
  }
  refresh();
  return actionOk();
}

export async function updateColourAction(id: string, input: ColourFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = colourFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await updateColour(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the colour");
  }
  refresh();
  return actionOk();
}

export async function deleteColourAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteColour(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the colour");
  }
  refresh();
  return actionOk();
}
