import { eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { colours } from "@/db/schema";
import { withUniqueMessage } from "@/lib/db-errors";
import { assertNotInUse } from "@/lib/in-use";
import type { colourFormSchema } from "@/validation/catalogue";
import { countProductsUsingColour } from "./queries";

type ColourData = z.output<typeof colourFormSchema>;
const DUPLICATE_MESSAGE = "A colour with this name already exists";

export async function createColour(data: ColourData): Promise<void> {
  await withUniqueMessage(() => db.insert(colours).values(data), DUPLICATE_MESSAGE);
}

export async function updateColour(id: string, data: ColourData): Promise<void> {
  await withUniqueMessage(() => db.update(colours).set(data).where(eq(colours.id, id)), DUPLICATE_MESSAGE);
}

/** Only colours no variant uses can be deleted. */
export async function deleteColour(id: string): Promise<void> {
  assertNotInUse(await countProductsUsingColour(id));
  await db.delete(colours).where(eq(colours.id, id));
}
