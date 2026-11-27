/** Only `published` products are shown in the shop. */
export const PRODUCT_STATUSES = ["draft", "published", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** `recliner` add-ons are listed in their own group on sofa pages. */
export const ADDON_KINDS = ["addon", "recliner"] as const;
export type AddonKind = (typeof ADDON_KINDS)[number];

/** `per_seat` price is multiplied by the variant's seat count. */
export const PRICE_UNITS = ["fixed", "per_seat"] as const;
export type PriceUnit = (typeof PRICE_UNITS)[number];
