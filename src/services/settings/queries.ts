import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { tagShopCache } from "@/lib/cache-tags";
import type { StoreInfo } from "@/types/shop";

/** Shown until staff fill in store settings, so pages never break. */
const EMPTY_STORE_INFO: StoreInfo = {
  name: "Cot & Couch",
  address: "",
  mapUrl: "",
  timings: "",
  phone: "",
  whatsapp: "",
  privacyNotice: "",
};

export async function getStoreInfo(): Promise<StoreInfo> {
  "use cache";
  tagShopCache();
  const [row] = await db.select().from(storeSettings).limit(1);
  if (!row) return EMPTY_STORE_INFO;
  return {
    name: row.name,
    address: row.address,
    mapUrl: row.mapUrl,
    timings: row.timings,
    phone: row.phone,
    whatsapp: row.whatsapp,
    privacyNotice: row.privacyNotice,
  };
}
