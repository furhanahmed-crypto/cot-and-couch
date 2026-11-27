import * as schema from "@/db/schema";
import { MATTRESS_BRANDS, MATTRESS_MODELS, MATTRESS_PRICES, MATTRESS_SIZES } from "./data/mattresses";
import { db } from "./db";
import { lowestPriceOf, newId, rankByLowestPrice, toMoney, toMoneyOrNull, toSkuPart } from "./helpers";
import type { SeededCategory, SeededVariant } from "./types";

type MattressProduct = {
  id: string;
  brandId: string;
  brandSlug: string;
  name: string;
  slug: string;
  model: (typeof MATTRESS_MODELS)[number];
};
type MattressVariant = SeededVariant & { lengthIn: number; widthIn: number; thicknessIn: number };

function buildProducts(brandIds: Record<string, string>): MattressProduct[] {
  return MATTRESS_BRANDS.flatMap((brand) =>
    MATTRESS_MODELS.map((model) => ({
      id: newId(),
      brandId: brandIds[brand.slug],
      brandSlug: brand.slug,
      name: `${brand.name} ${model.name}`,
      slug: `${brand.slug}-${model.slug}`,
      model,
    })),
  );
}

function buildVariants(product: MattressProduct): MattressVariant[] {
  return MATTRESS_PRICES.map((row) => {
    const size = MATTRESS_SIZES.find((item) => item.sizeLabel === row.size)!;
    return {
      id: newId(),
      productId: product.id,
      productName: product.name,
      sku: ["MAT", product.slug, row.size, `${row.thicknessIn}IN`].map(toSkuPart).join("-"),
      sizeLabel: row.size,
      lengthIn: size.lengthIn,
      widthIn: size.widthIn,
      thicknessIn: row.thicknessIn,
      seats: null,
      qualityId: null,
      qualityName: null,
      colourName: null,
      mrp: row.mrp,
      price: row.price,
    };
  });
}

function toVariantRow(variant: MattressVariant, sortOrder: number) {
  return {
    id: variant.id,
    productId: variant.productId,
    sku: variant.sku,
    sizeLabel: variant.sizeLabel,
    lengthIn: variant.lengthIn,
    widthIn: variant.widthIn,
    thicknessIn: variant.thicknessIn,
    mrp: toMoneyOrNull(variant.mrp),
    price: toMoney(variant.price),
    sortOrder,
  };
}

export async function seedMattresses(categoryId: string): Promise<SeededCategory> {
  const brandRows = MATTRESS_BRANDS.map((brand, index) => ({
    id: newId(), categoryId, name: brand.name, slug: brand.slug, sortOrder: index + 1,
  }));
  const products = buildProducts(Object.fromEntries(brandRows.map((row) => [row.slug, row.id])));
  const variants = products.flatMap(buildVariants);

  const sortOrders = rankByLowestPrice(lowestPriceOf(products.map((product) => product.id), variants));

  await db.batch([
    db.insert(schema.brands).values(brandRows),
    db.insert(schema.products).values(
      products.map((product, index) => ({
        id: product.id, categoryId, brandId: product.brandId, name: product.name, slug: product.slug,
        status: "published" as const, sortOrder: sortOrders[index],
        isFeatured: sortOrders[index] === 1, // demo: the cheapest product of each category is featured
      })),
    ),
    db.insert(schema.productSpecs).values(
      products.flatMap((product) =>
        Object.entries(product.model.specs).map(([label, value], index) => ({
          productId: product.id, label, value, sortOrder: index + 1,
        })),
      ),
    ),
    db.insert(schema.productImages).values(
      products.map((product) => ({
        productId: product.id,
        url: `/images/mattresses/${product.brandSlug}/${product.model.slug}.jpg`,
        alt: product.name,
      })),
    ),
    db.insert(schema.productVariants).values(variants.map((variant, index) => toVariantRow(variant, index + 1))),
  ]);

  return { productIds: products.map((product) => product.id), variants, addons: [] };
}
