/** Category slugs used in code. The only place these strings may appear. */
export const CATEGORY_SLUGS = {
  mattresses: "mattresses",
  cots: "cots",
  sofas: "sofas",
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];

/** Admin and DB say "Cots"; the shop says "Beds". */
const SHOP_CATEGORY_NAMES: Record<string, string> = {
  [CATEGORY_SLUGS.cots]: "Beds",
};

export function getShopCategoryName(slug: string, name: string): string {
  return SHOP_CATEGORY_NAMES[slug] ?? name;
}

export function getCategoryCoverImage(slug: string): string {
  return `/images/${slug}/cover.jpg`;
}
