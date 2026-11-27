"use server";

import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listProductCardsByIds } from "@/services/catalogue/product-card-queries";
import { recordLeadEvent } from "@/services/leads/mutations";
import type { ActionResult } from "@/types/action";
import type { ProductCardItem } from "@/types/catalogue";
import { ctaSchema, idSchema, type CtaInput } from "@/validation/shop";

const RECENT_LIMIT = 8;

/** Recently viewed products (ids come from the browser). */
export async function getProductCardsByIdsAction(ids: string[]): Promise<ProductCardItem[]> {
  const validIds = ids.filter((id) => idSchema.safeParse(id).success).slice(0, RECENT_LIMIT);
  return listProductCardsByIds(validIds);
}

/** Product page view, for the lead's activity. Never fails the page. */
export async function trackProductViewAction(productId: string): Promise<void> {
  const parsed = idSchema.safeParse(productId);
  const profile = await getCurrentProfile();
  if (!parsed.success || !profile) return;
  await recordLeadEvent({ profile, type: "view", productId: parsed.data }).catch((error: unknown) => {
    console.error("[lead] could not record view", error);
  });
}

/** Call, WhatsApp, visit and callback requests: saved on the lead so staff follow up. */
export async function recordCtaAction(input: CtaInput): Promise<ActionResult> {
  const parsed = ctaSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const profile = await getCurrentProfile();
    if (!profile) return actionOk();
    const details: Record<string, string> = { action: parsed.data.action };
    if (parsed.data.note) details.note = parsed.data.note;
    await recordLeadEvent({ profile, type: "cta", productId: parsed.data.productId, details });
  } catch (error) {
    return toActionError(error, "Could not send your request");
  }
  return actionOk();
}
