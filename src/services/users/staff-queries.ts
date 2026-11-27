import { asc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { OptionItem } from "@/types/admin-products";

/** Admin and team members, for "Assigned to" choices. */
export async function listStaffOptions(): Promise<OptionItem[]> {
  const rows = await db
    .select({ id: profiles.id, name: profiles.name, email: profiles.email })
    .from(profiles)
    .where(inArray(profiles.role, ["admin", "team"]))
    .orderBy(asc(profiles.name));
  return rows.map((row) => ({ id: row.id, name: row.name ?? row.email }));
}

/** True when the id belongs to an admin or team member. */
export async function isStaffProfileId(id: string): Promise<boolean> {
  const options = await listStaffOptions();
  return options.some((option) => option.id === id);
}
