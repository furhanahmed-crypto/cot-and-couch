"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { revalidateShopCache } from "@/lib/cache-tags";
import { optionGroups, options } from "@/db/schema";
import { requireStaffProfile } from "@/services/profile";
import { ROUTES } from "@/constants/routes";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listOptionGroupsAction() {
  await requireStaffProfile();
  const groups = await db
    .select()
    .from(optionGroups)
    .orderBy(asc(optionGroups.sortOrder));
  const opts = await db
    .select()
    .from(options)
    .orderBy(asc(options.sortOrder));
  return groups.map((g) => ({
    ...g,
    options: opts.filter((o) => o.groupId === g.id),
  }));
}

export async function createOptionAction(input: {
  groupKey: string;
  label: string;
  hex?: string;
}) {
  await requireStaffProfile();
  const group = await db
    .select()
    .from(optionGroups)
    .where(eq(optionGroups.key, input.groupKey))
    .limit(1);
  if (!group[0]) return { ok: false as const, error: "Group not found" };
  const slug = slugify(input.label);
  if (!slug) return { ok: false as const, error: "Label required" };
  await db.insert(options).values({
    groupId: group[0].id,
    label: input.label.trim(),
    slug,
    hex: input.hex?.trim() || null,
    sortOrder: 99,
  });
  revalidatePath(ROUTES.admin.attributes);
  revalidatePath(ROUTES.admin.masters);
  revalidateShopCache();
  return { ok: true as const };
}

export async function updateOptionAction(input: {
  id: string;
  label: string;
  isActive: boolean;
  hex?: string;
}) {
  await requireStaffProfile();
  await db
    .update(options)
    .set({
      label: input.label.trim(),
      isActive: input.isActive,
      hex: input.hex?.trim() || null,
    })
    .where(eq(options.id, input.id));
  revalidatePath(ROUTES.admin.attributes);
  revalidatePath(ROUTES.admin.masters);
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteOptionAction(id: string) {
  await requireStaffProfile();
  await db.delete(options).where(eq(options.id, id));
  revalidatePath(ROUTES.admin.attributes);
  revalidatePath(ROUTES.admin.masters);
  revalidateShopCache();
  return { ok: true as const };
}

export async function createOptionGroupAction(input: {
  key: string;
  label: string;
}) {
  await requireStaffProfile();
  const key = slugify(input.key || input.label).replace(/-/g, "_");
  if (!key) return { ok: false as const, error: "Key required" };
  await db.insert(optionGroups).values({
    key,
    label: input.label.trim(),
    sortOrder: 99,
  });
  revalidatePath(ROUTES.admin.attributes);
  revalidateShopCache();
  return { ok: true as const };
}

export async function deleteOptionGroupAction(id: string) {
  await requireStaffProfile();
  await db.delete(optionGroups).where(eq(optionGroups.id, id));
  revalidatePath(ROUTES.admin.attributes);
  revalidateShopCache();
  return { ok: true as const };
}
