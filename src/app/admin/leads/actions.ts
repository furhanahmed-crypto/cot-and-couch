"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { requireStaff } from "@/services/auth/require-staff";
import { deleteLead, updateLead } from "@/services/leads/admin-mutations";
import type { ActionResult } from "@/types/action";
import { idSchema } from "@/validation/common";
import { leadUpdateSchema, type LeadUpdateInput } from "@/validation/leads";

function refresh() {
  revalidatePath(ROUTES.admin.leads);
  revalidatePath(ROUTES.admin.root);
}

export async function updateLeadAction(leadId: string, input: LeadUpdateInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(leadId);
  const parsed = leadUpdateSchema.safeParse(input);
  if (!parsedId.success) return validationError(parsedId.error);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff();
    await updateLead(parsedId.data, parsed.data);
  } catch (error) {
    return toActionError(error, "Could not save the lead");
  }
  refresh();
  return actionOk();
}

/** Admin only. */
export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(leadId);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    await deleteLead(parsed.data);
  } catch (error) {
    return toActionError(error, "Could not delete the lead");
  }
  refresh();
  return actionOk();
}
