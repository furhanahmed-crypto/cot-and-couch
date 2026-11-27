import { and, count, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { colours, productVariants, products, qualities } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { makeUniqueSlug, toSlug } from "@/lib/slug";

export type VariantProduct = { id: string; slug: string; categoryId: string; status: string };

export async function getVariantProduct(productId: string): Promise<VariantProduct> {
  const [row] = await db
    .select({ id: products.id, slug: products.slug, categoryId: products.categoryId, status: products.status })
    .from(products)
    .where(eq(products.id, productId));
  if (!row) throw new AppError("This product no longer exists");
  return row;
}

/** Qualities must be of the product's category; new variants need active qualities and colours. */
export async function getChoiceNames(product: VariantProduct, qualityIds: string[], colourIds: string[], isNew: boolean) {
  const [qualityRows, colourRows] = await Promise.all([
    qualityIds.length ? db.select().from(qualities).where(inArray(qualities.id, qualityIds)) : Promise.resolve([]),
    colourIds.length ? db.select().from(colours).where(inArray(colours.id, colourIds)) : Promise.resolve([]),
  ]);
  if (qualityRows.length !== qualityIds.length || qualityRows.some((quality) => quality.categoryId !== product.categoryId)) {
    throw new AppError("Choose a quality of this product's category");
  }
  if (colourRows.length !== colourIds.length) throw new AppError("That colour no longer exists");
  if (isNew && [...qualityRows, ...colourRows].some((row) => !row.isActive)) {
    throw new AppError("Inactive qualities and colours cannot be used for new variants");
  }
  return {
    qualitySlug: new Map(qualityRows.map((quality) => [quality.id, quality.slug])),
    colourName: new Map(colourRows.map((colour) => [colour.id, colour.name])),
  };
}

type SkuParts = { sizeLabel: string; lengthIn: number | null; thicknessIn: number | null; qualitySlug?: string; colourName?: string };

/** PRODUCT-SIZE-LENGTH-THICKNESS-QUALITY-COLOUR, upper case, made unique with -2, -3… */
export function buildSku(productSlug: string, parts: SkuParts, takenSkus: string[]): string {
  const pieces = [productSlug, parts.sizeLabel, parts.lengthIn, parts.thicknessIn ? `${parts.thicknessIn}in` : null, parts.qualitySlug, parts.colourName];
  const base = toSlug(pieces.filter((piece) => piece !== null && piece !== undefined && piece !== "").join("-")).toUpperCase();
  return makeUniqueSlug(base, takenSkus);
}

export async function listTakenSkus(): Promise<string[]> {
  const rows = await db.select({ sku: productVariants.sku }).from(productVariants);
  return rows.map((row) => row.sku);
}

/** A published product must keep at least one active variant, or it has no price in the shop. */
export async function assertKeepsActiveVariant(product: VariantProduct, variantId: string): Promise<void> {
  if (product.status !== "published") return;
  const [row] = await db
    .select({ total: count() })
    .from(productVariants)
    .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true), ne(productVariants.id, variantId)));
  if (!row?.total) throw new AppError("This is the last active variant of a published product. Unpublish the product first.");
}
