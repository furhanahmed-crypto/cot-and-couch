// Row types inferred from the Drizzle schema. Never hand-write a row type.
import type * as schema from "@/db/schema";

export type ProfileRow = typeof schema.profiles.$inferSelect;

export type CategoryRow = typeof schema.categories.$inferSelect;
export type QualityRow = typeof schema.qualities.$inferSelect;
export type ProductVariantRow = typeof schema.productVariants.$inferSelect;
export type AddonRow = typeof schema.addons.$inferSelect;
export type CollectionRow = typeof schema.collections.$inferSelect;

