import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { isStaffProfileId } from "@/services/users/staff-queries";
import type { leadUpdateSchema } from "@/validation/leads";

type LeadUpdate = z.output<typeof leadUpdateSchema>;

export async function updateLead(leadId: string, data: LeadUpdate): Promise<void> {
  if (data.assignedToId && !(await isStaffProfileId(data.assignedToId))) throw new AppError("Choose a team member");
  const updated = await db.update(leads).set(data).where(eq(leads.id, leadId)).returning({ id: leads.id });
  if (!updated.length) throw new AppError("This lead no longer exists");
}

/** Removes the lead and its activity. The customer's account and orders stay. */
export async function deleteLead(leadId: string): Promise<void> {
  await db.delete(leads).where(eq(leads.id, leadId));
}
