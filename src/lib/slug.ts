/** "Royal Range 2" -> "royal-range-2". Letters and numbers only, joined by "-". */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** The slug, or slug-2, slug-3… when it is already taken. */
export function makeUniqueSlug(slug: string, takenSlugs: string[]): string {
  const taken = new Set(takenSlugs);
  if (!taken.has(slug)) return slug;
  let suffix = 2;
  while (taken.has(`${slug}-${suffix}`)) suffix += 1;
  return `${slug}-${suffix}`;
}
