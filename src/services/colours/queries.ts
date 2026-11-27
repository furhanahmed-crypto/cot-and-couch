import { asc, countDistinct, eq } from "drizzle-orm";
import { db } from "@/db";
import { colours, productVariants } from "@/db/schema";
import type { ColourAdminRow } from "@/types/admin-catalogue";

export async function listColoursForAdmin(): Promise<ColourAdminRow[]> {
  return db
    .select({
      id: colours.id,
      name: colours.name,
      hex: colours.hex,
      isActive: colours.isActive,
      sortOrder: colours.sortOrder,
      productCount: countDistinct(productVariants.productId),
    })
    .from(colours)
    .leftJoin(productVariants, eq(productVariants.colourId, colours.id))
    .groupBy(colours.id)
    .orderBy(asc(colours.sortOrder), asc(colours.name));
}

/** Products with a variant in this colour (0 = safe to delete). */
export async function countProductsUsingColour(colourId: string): Promise<number> {
  const [row] = await db
    .select({ total: countDistinct(productVariants.productId) })
    .from(productVariants)
    .where(eq(productVariants.colourId, colourId));
  return row?.total ?? 0;
}
