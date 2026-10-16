import { cacheLife, cacheTag, updateTag } from "next/cache";

/** Tag on every cached shop read (catalogue, masters, store, gallery, reels). */
export const SHOP_CACHE_TAG = "shop";

/** Call inside `"use cache"` functions that read public shop data. */
export function tagShopCache() {
  cacheTag(SHOP_CACHE_TAG);
  cacheLife("hours");
}

/** Expire shop cache from admin Server Actions after catalogue/ops writes. */
export function revalidateShopCache() {
  updateTag(SHOP_CACHE_TAG);
}
