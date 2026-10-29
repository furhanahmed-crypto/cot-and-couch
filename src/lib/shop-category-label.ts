import type { Category } from "@/types";

/**
 * Customer-facing labels only.
 * Admin / DB use “Cots” (slug `cots`); shop shows “Beds” for clarity.
 */
const SHOP_LABEL_BY_SLUG: Record<string, string> = {
  cots: "Beds",
};

export function shopCategoryDisplayName(category: {
  slug: string;
  name: string;
}): string {
  return SHOP_LABEL_BY_SLUG[category.slug] ?? category.name;
}

export function categoryForShop(category: Category): Category {
  const name = shopCategoryDisplayName(category);
  return name === category.name ? category : { ...category, name };
}

export function categoriesForShop(categories: Category[]): Category[] {
  return categories.map(categoryForShop);
}
