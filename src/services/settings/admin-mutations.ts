import type { z } from "zod";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import type { storeSettingsSchema } from "@/validation/settings";

type StoreSettingsData = z.output<typeof storeSettingsSchema>;

/** There is exactly one row (id = 1): create it the first time, update it after (a trigger sets updated_at). */
export async function saveStoreSettings(data: StoreSettingsData): Promise<void> {
  await db
    .insert(storeSettings)
    .values({ id: 1, ...data })
    .onConflictDoUpdate({ target: storeSettings.id, set: data });
}
