"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { createAddon, deleteAddon, saveAddonPriceGrid, updateAddon } from "@/services/addons/mutations";
import { includesCategoryAddon } from "@/services/addons/queries";
import { requireStaff } from "@/services/auth/require-staff";
import type { ActionResult } from "@/types/action";
import { addonFormSchema, addonPriceGridSchema, type AddonFormInput, type AddonPriceGridInput } from "@/validation/catalogue";
import { idSchema } from "@/validation/common";

// Used by both the category Add-ons tab (cots) and the product Add-ons tab (sofas).
// Category add-ons are admin-only; product add-ons can be edited by the team.
// Who may change an existing add-on is decided from the database, never from the browser.

function refresh() {
  revalidatePath(ROUTES.admin.categories, "layout");
  revalidatePath(ROUTES.admin.products, "layout");
  revalidateShopCache();
}

/** Admin for category-wide add-ons (as stored in the DB), team for product add-ons. */
async function requireRoleForAddons(addonIds: string[]): Promise<void> {
  await requireStaff();
  if (await includesCategoryAddon(addonIds)) await requireStaff("admin");
}

export async function createAddonAction(input: AddonFormInput): Promise<ActionResult> {
  const parsed = addonFormSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff(parsed.data.productId ? "team" : "admin");
    await createAddon(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not add the add-on");
  }
  refresh();
  return actionOk();
}

export async function updateAddonAction(id: string, input: AddonFormInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = addonFormSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireRoleForAddons([parsedId.data]);
    await updateAddon(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the add-on");
  }
  refresh();
  return actionOk();
}

export async function deleteAddonAction(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireRoleForAddons([parsed.data]);
    await deleteAddon(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the add-on");
  }
  refresh();
  return actionOk();
}

export async function saveAddonPricesAction(input: AddonPriceGridInput): Promise<ActionResult> {
  const parsed = addonPriceGridSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireRoleForAddons(parsed.data.addonIds);
    await saveAddonPriceGrid(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the prices");
  }
  refresh();
  return actionOk();
}
