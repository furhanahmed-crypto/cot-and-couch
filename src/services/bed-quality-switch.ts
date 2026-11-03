import { and, eq, inArray } from "drizzle-orm";
import { db, products } from "@/db";
import { tagShopCache } from "@/lib/cache-tags";
import {
  BED_QUALITY_SWITCH_RANGE_SLUGS,
  bedQualityLabel,
  bedStyleKeyFromProductSlug,
  isBedQualitySwitchRange,
} from "@/constants/bed-model";

export type BedQualitySwitchOption = {
  rangeSlug: string;
  label: string;
  productSlug: string;
};

/** Ideal / Optimum / Essential siblings for the same style (Classic, etc.). */
export async function getBedQualitySwitchOptions(input: {
  bedRangeSlug: string | null | undefined;
  productSlug: string;
}): Promise<BedQualitySwitchOption[]> {
  "use cache";
  tagShopCache();

  if (!isBedQualitySwitchRange(input.bedRangeSlug)) return [];
  const styleKey = bedStyleKeyFromProductSlug(
    input.productSlug,
    input.bedRangeSlug,
  );
  if (!styleKey) return [];

  const wanted = BED_QUALITY_SWITCH_RANGE_SLUGS.map((rangeSlug) => ({
    rangeSlug,
    label: bedQualityLabel(rangeSlug),
    productSlug: `${rangeSlug}-${styleKey}`,
  }));

  const rows = await db
    .select({ slug: products.slug })
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        inArray(
          products.slug,
          wanted.map((w) => w.productSlug),
        ),
      ),
    );

  const found = new Set(rows.map((r) => r.slug));
  return wanted.filter((w) => found.has(w.productSlug));
}
