import { and, asc, eq } from "drizzle-orm";
import { db, categoryAddons, categories } from "@/db";
import { BED_CATEGORY_SLUG } from "@/constants/bed-model";

export type { ShopBedAddon } from "@/constants/bed-pricing";
export { resolveShopBedAddons } from "@/constants/bed-pricing";

export async function listBedCategoryAddons() {
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, BED_CATEGORY_SLUG))
    .limit(1);
  if (!cat) return [];

  return db
    .select()
    .from(categoryAddons)
    .where(
      and(
        eq(categoryAddons.categoryId, cat.id),
        eq(categoryAddons.isActive, true),
      ),
    )
    .orderBy(asc(categoryAddons.sortOrder));
}
