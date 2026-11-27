import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands, categories, collections, colours, productCollections, productImages, productSpecs, productVariants, products } from "@/db/schema";
import { hasProductAddons } from "@/constants/categories";
import { toRupees, toRupeesOrNull } from "@/lib/money";
import { listProductAddons } from "@/services/addons/queries";
import { getCategoryDetail } from "@/services/categories/queries";
import type { ProductEditorData, VariantAdminRow } from "@/types/admin-products";
import type { ProductVariantRow } from "@/types/db";
import { isProductOrdered } from "./rules";

function toVariantAdminRow(row: ProductVariantRow): VariantAdminRow {
  return {
    id: row.id, sku: row.sku, sizeLabel: row.sizeLabel, lengthIn: row.lengthIn, widthIn: row.widthIn,
    thicknessIn: row.thicknessIn, seats: row.seats, qualityId: row.qualityId, colourId: row.colourId,
    mrp: toRupeesOrNull(row.mrp), price: toRupees(row.price), isActive: row.isActive,
  };
}

/** Lists for the editor's selects: all brands of the category, every colour and collection. */
async function listChoices(categoryId: string) {
  return Promise.all([
    db.select({ id: brands.id, name: brands.name }).from(brands).where(eq(brands.categoryId, categoryId)).orderBy(asc(brands.sortOrder)),
    db.select({ id: colours.id, name: colours.name, hex: colours.hex, isActive: colours.isActive }).from(colours).orderBy(asc(colours.sortOrder)),
    db.select({ id: collections.id, name: collections.name }).from(collections).orderBy(asc(collections.sortOrder)),
  ]);
}

export async function getProductEditorData(id: string): Promise<ProductEditorData | null> {
  const [found] = await db
    .select({ product: products, category: { id: categories.id, name: categories.name, slug: categories.slug } })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.id, id));
  if (!found) return null;
  const { product, category } = found;

  const [[brandRows, colourRows, collectionRows], categoryDetail, links, images, specs, variants, addons, isOrdered] = await Promise.all([
    listChoices(category.id),
    getCategoryDetail(category.id),
    db.select().from(productCollections).where(eq(productCollections.productId, id)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productSpecs).where(eq(productSpecs.productId, id)).orderBy(asc(productSpecs.sortOrder)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.sortOrder)),
    hasProductAddons(category.slug) ? listProductAddons(id) : Promise.resolve([]),
    isProductOrdered(id),
  ]);

  return {
    product: {
      id: product.id, name: product.name, slug: product.slug, description: product.description, status: product.status,
      isFeatured: product.isFeatured, brandId: product.brandId, updatedAt: product.updatedAt.toISOString(),
    },
    category,
    brands: brandRows,
    qualities: categoryDetail?.qualities ?? [],
    colours: colourRows,
    collections: collectionRows,
    collectionIds: links.map((link) => link.collectionId),
    images: images.map((image) => ({ url: image.url, alt: image.alt })),
    specs: specs.map((spec) => ({ label: spec.label, value: spec.value })),
    variants: variants.map(toVariantAdminRow),
    addons,
    isOrdered,
  };
}
