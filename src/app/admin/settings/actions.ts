"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { revalidateShopCache } from "@/lib/cache-tags";
import { requireStaff } from "@/services/auth/require-staff";
import { saveStoreSettings } from "@/services/settings/admin-mutations";
import type { ActionResult } from "@/types/action";
import { storeSettingsSchema, type StoreSettingsInput } from "@/validation/settings";

/** Admin only. The shop shows the new details straight away. */
export async function saveStoreSettingsAction(input: StoreSettingsInput): Promise<ActionResult> {
  const parsed = storeSettingsSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await saveStoreSettings(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the store details");
  }
  revalidatePath(ROUTES.admin.settings);
  revalidateShopCache();
  return actionOk();
}
