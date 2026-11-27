import { CATEGORY_SLUGS, type CategorySlug } from "@/constants/categories";
import * as schema from "@/db/schema";
import { db } from "./db";
import { newId } from "./helpers";

const CATEGORIES: { name: string; slug: CategorySlug }[] = [
  { name: "Mattresses", slug: CATEGORY_SLUGS.mattresses },
  { name: "Cots", slug: CATEGORY_SLUGS.cots },
  { name: "Sofas", slug: CATEGORY_SLUGS.sofas },
];

// Wood finishes named in docs/client/phase1-requirements.pdf.
const COLOURS = [
  { name: "Teak", hex: "#C19A6B" },
  { name: "Walnut", hex: "#5C4033" },
  { name: "Honey", hex: "#E8B86D" },
  { name: "Natural", hex: "#E8D5B7" },
];

export type SeededColour = { id: string; name: string };

export async function seedCategoriesAndColours() {
  const categoryRows = CATEGORIES.map((category, index) => ({
    id: newId(),
    ...category,
    sortOrder: index + 1,
  }));
  const colourRows = COLOURS.map((colour, index) => ({
    id: newId(),
    ...colour,
    sortOrder: index + 1,
  }));

  await db.batch([
    db.insert(schema.categories).values(categoryRows),
    db.insert(schema.colours).values(colourRows),
  ]);

  const categoryIds = Object.fromEntries(
    categoryRows.map((row) => [row.slug, row.id]),
  ) as Record<CategorySlug, string>;
  const colours: SeededColour[] = colourRows.map(({ id, name }) => ({ id, name }));
  return { categoryIds, colours };
}
