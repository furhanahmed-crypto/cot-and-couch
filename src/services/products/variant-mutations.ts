import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { withUniqueMessage } from "@/lib/db-errors";
import { toMoney, toMoneyOrNull } from "@/lib/money";
import type { variantFormSchema } from "@/validation/products";
import { isVariantOrdered } from "./rules";
import { assertKeepsActiveVariant, buildSku, getChoiceNames, getVariantProduct, listTakenSkus } from "./variant-lookups";

type VariantData = z.output<typeof variantFormSchema>;

export const DUPLICATE_VARIANT_MESSAGE = "This variant already exists";
const CHOICE_CONSTRAINT = "product_variants_choice_key";

function toColumns(data: VariantData) {
  return {
    sizeLabel: data.sizeLabel, lengthIn: data.lengthIn, widthIn: data.widthIn, thicknessIn: data.thicknessIn,
    seats: data.seats, qualityId: data.qualityId, colourId: data.colourId,
    mrp: toMoneyOrNull(data.mrp), price: toMoney(data.price), isActive: data.isActive,
  };
}

/** The SKU is made from the product and the choices; it never changes after that. */
export async function createVariant(data: VariantData): Promise<void> {
  const product = await getVariantProduct(data.productId);
  const qualityIds = data.qualityId ? [data.qualityId] : [];
  const colourIds = data.colourId ? [data.colourId] : [];
  const names = await getChoiceNames(product, qualityIds, colourIds, true);
  const sku = buildSku(
    product.slug,
    { ...data, qualitySlug: names.qualitySlug.get(data.qualityId ?? ""), colourName: names.colourName.get(data.colourId ?? "") },
    await listTakenSkus(),
  );
  await withUniqueMessage(
    () => db.insert(productVariants).values({ ...toColumns(data), productId: product.id, sku }),
    DUPLICATE_VARIANT_MESSAGE,
    CHOICE_CONSTRAINT,
  );
}

async function getOwnVariant(id: string, productId: string) {
  const [row] = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.id, id), eq(productVariants.productId, productId)));
  if (!row) throw new AppError("This variant no longer exists");
  return row;
}

export async function updateVariant(id: string, data: VariantData): Promise<void> {
  const product = await getVariantProduct(data.productId);
  const current = await getOwnVariant(id, product.id);
  await getChoiceNames(product, data.qualityId ? [data.qualityId] : [], data.colourId ? [data.colourId] : [], false);
  if (current.isActive && !data.isActive) await assertKeepsActiveVariant(product, id);
  await withUniqueMessage(
    () => db.update(productVariants).set(toColumns(data)).where(eq(productVariants.id, id)),
    DUPLICATE_VARIANT_MESSAGE,
    CHOICE_CONSTRAINT,
  );
}

export async function setVariantActive(id: string, isActive: boolean): Promise<void> {
  const [row] = await db.select({ productId: productVariants.productId }).from(productVariants).where(eq(productVariants.id, id));
  if (!row) throw new AppError("This variant no longer exists");
  if (!isActive) await assertKeepsActiveVariant(await getVariantProduct(row.productId), id);
  await db.update(productVariants).set({ isActive }).where(eq(productVariants.id, id));
}

/** Variants in orders are kept (deactivate them instead), so order history stays linked. */
export async function deleteVariant(id: string): Promise<void> {
  const [row] = await db
    .select({ productId: productVariants.productId, isActive: productVariants.isActive })
    .from(productVariants)
    .where(eq(productVariants.id, id));
  if (!row) return;
  if (await isVariantOrdered(id)) throw new AppError("This variant is in orders. Deactivate it instead.");
  if (row.isActive) await assertKeepsActiveVariant(await getVariantProduct(row.productId), id);
  await db.delete(productVariants).where(eq(productVariants.id, id));
}
