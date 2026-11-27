import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import {
  addonPrices,
  addons,
  brands,
  categories,
  colours,
  productImages,
  productSpecs,
  productVariants,
  products,
  qualities,
} from "@/db/schema";
import { getShopCategoryName } from "@/constants/categories";
import { tagShopCache } from "@/lib/cache-tags";
import { toRupees } from "@/lib/money";
import type { AddonOption, ProductDetail } from "@/types/catalogue";
import { toQualityItem, toVariantOption, uniqueColours } from "./mappers";

async function findPublishedProduct(slug: string) {
  const [row] = await db
    .select({ product: products, categoryName: categories.name, categorySlug: categories.slug, brandName: brands.name })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(products.slug, slug), eq(products.status, "published")))
    .limit(1);
  return row ?? null;
}

/** Category-wide add-ons (cots) plus this product's own add-ons (sofas), with prices. */
async function listAddonsFor(productId: string, categoryId: string): Promise<AddonOption[]> {
  const addonRows = await db
    .select()
    .from(addons)
    .where(
      and(
        eq(addons.isActive, true),
        eq(addons.categoryId, categoryId),
        or(isNull(addons.productId), eq(addons.productId, productId)),
      ),
    )
    .orderBy(asc(addons.sortOrder));
  if (!addonRows.length) return [];
  const priceRows = await db
    .select()
    .from(addonPrices)
    .where(inArray(addonPrices.addonId, addonRows.map((addon) => addon.id)));
  return addonRows.map((addon) => ({
    id: addon.id,
    name: addon.name,
    kind: addon.kind,
    priceUnit: addon.priceUnit,
    sizeLabel: addon.sizeLabel,
    prices: Object.fromEntries(
      priceRows.filter((price) => price.addonId === addon.id).map((price) => [price.qualityId, toRupees(price.price)]),
    ),
  }));
}

export async function getProductDetailBySlug(slug: string): Promise<ProductDetail | null> {
  "use cache";
  tagShopCache();
  const found = await findPublishedProduct(slug);
  if (!found) return null;
  const { product } = found;

  const [variantRows, imageRows, specRows, addonOptions] = await Promise.all([
    db
      .select({ variant: productVariants, quality: qualities, colour: { id: colours.id, name: colours.name, hex: colours.hex } })
      .from(productVariants)
      .leftJoin(qualities, eq(qualities.id, productVariants.qualityId))
      .leftJoin(colours, eq(colours.id, productVariants.colourId))
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)))
      .orderBy(asc(qualities.sortOrder), asc(productVariants.sortOrder)),
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productSpecs).where(eq(productSpecs.productId, product.id)).orderBy(asc(productSpecs.sortOrder)),
    listAddonsFor(product.id, product.categoryId),
  ]);

  const qualityById = new Map(variantRows.flatMap((row) => (row.quality ? [[row.quality.id, row.quality]] : [])));
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    categoryName: getShopCategoryName(found.categorySlug, found.categoryName),
    categorySlug: found.categorySlug,
    brandName: found.brandName,
    images: imageRows.map((image) => ({ url: image.url, alt: image.alt })),
    specs: specRows.map((spec) => ({ label: spec.label, value: spec.value })),
    qualities: [...qualityById.values()].map(toQualityItem),
    colours: uniqueColours(variantRows.map((row) => row.colour)),
    variants: variantRows.map((row) => toVariantOption(row.variant)),
    addons: addonOptions,
  };
}
