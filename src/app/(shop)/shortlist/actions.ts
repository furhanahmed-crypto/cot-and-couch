"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { getCurrentProfile } from "@/lib/auth/profile";
import { requireProfile } from "@/services/auth/require-profile";
import { addToShortlist, removeFromShortlist } from "@/services/shortlist/mutations";
import { listShortlistProductIds } from "@/services/shortlist/queries";
import type { ActionResult } from "@/types/action";
import { shortlistSchema } from "@/validation/shop";

export async function setShortlistedAction(productId: string, isShortlisted: boolean): Promise<ActionResult> {
  const parsed = shortlistSchema.safeParse({ productId, isShortlisted });
  if (!parsed.success) return validationError(parsed.error);
  try {
    const profile = await requireProfile();
    if (parsed.data.isShortlisted) await addToShortlist(profile, parsed.data.productId);
    else await removeFromShortlist(profile.id, parsed.data.productId);
  } catch (error) {
    return toActionError(error, "Could not update your shortlist");
  }
  revalidatePath(ROUTES.shortlist);
  return actionOk();
}

/** Ids for the heart buttons. Guests have none. */
export async function getShortlistIdsAction(): Promise<string[]> {
  const profile = await getCurrentProfile();
  return profile ? listShortlistProductIds(profile.id) : [];
}
