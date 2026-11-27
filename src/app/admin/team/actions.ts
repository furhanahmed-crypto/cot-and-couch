"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { requireStaff } from "@/services/auth/require-staff";
import { searchCustomers } from "@/services/orders/new-order-queries";
import { changeRole } from "@/services/users/team";
import type { ActionResult } from "@/types/action";
import type { CustomerMatch } from "@/types/admin-orders";
import { customerSearchSchema } from "@/validation/orders";
import { roleChangeSchema, type RoleChangeInput } from "@/validation/team";

/** Admin only. Also used by "Add staff" (customer -> team or admin). */
export async function changeRoleAction(input: RoleChangeInput): Promise<ActionResult> {
  const parsed = roleChangeSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const admin = await requireStaff("admin");
    await changeRole(parsed.data.profileId, parsed.data.role, admin.id);
  } catch (error) {
    return toActionError(error, "Could not change the role");
  }
  revalidatePath(ROUTES.admin.team);
  return actionOk();
}

/** Registered customers who could be given staff access. */
export async function searchPeopleAction(query: string): Promise<ActionResult<CustomerMatch[]>> {
  const parsed = customerSearchSchema.safeParse(query);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await requireStaff("admin");
    return actionOk(await searchCustomers(parsed.data));
  } catch (error) {
    return toActionError(error, "Could not search");
  }
}
