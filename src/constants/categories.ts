/** Category slugs used in code. The only place these strings may appear. */
export const CATEGORY_SLUGS = {
  mattresses: "mattresses",
  cots: "cots",
  sofas: "sofas",
} as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[keyof typeof CATEGORY_SLUGS];
