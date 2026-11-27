// Row types inferred from the Drizzle schema. Never hand-write a row type.
import type * as schema from "@/db/schema";

export type ProfileRow = typeof schema.profiles.$inferSelect;
export type StoreSettingsRow = typeof schema.storeSettings.$inferSelect;

export type CategoryRow = typeof schema.categories.$inferSelect;
export type BrandRow = typeof schema.brands.$inferSelect;
export type QualityRow = typeof schema.qualities.$inferSelect;
export type ColourRow = typeof schema.colours.$inferSelect;
export type ProductRow = typeof schema.products.$inferSelect;
export type ProductImageRow = typeof schema.productImages.$inferSelect;
export type ProductSpecRow = typeof schema.productSpecs.$inferSelect;
export type ProductVariantRow = typeof schema.productVariants.$inferSelect;
export type AddonRow = typeof schema.addons.$inferSelect;
export type AddonPriceRow = typeof schema.addonPrices.$inferSelect;
export type CollectionRow = typeof schema.collections.$inferSelect;

export type ShortlistItemRow = typeof schema.shortlistItems.$inferSelect;
export type CartItemRow = typeof schema.cartItems.$inferSelect;

export type OrderRow = typeof schema.orders.$inferSelect;
export type OrderItemRow = typeof schema.orderItems.$inferSelect;
export type OrderItemAddonRow = typeof schema.orderItemAddons.$inferSelect;
export type OrderStatusHistoryRow = typeof schema.orderStatusHistory.$inferSelect;

export type LeadRow = typeof schema.leads.$inferSelect;
export type LeadEventRow = typeof schema.leadEvents.$inferSelect;
export type MediaRow = typeof schema.media.$inferSelect;
