import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { cartItemAddons, cartItems, productVariants, products } from "@/db/schema";
import { AppError } from "@/lib/action-result";
import { getAddonUnitPrice } from "@/lib/pricing";
import { CART_QUANTITY_MAX, type addToCartSchema } from "@/validation/shop";
import type { z } from "zod";
import { belongsToProduct, listAddonOptionsByIds } from "./addon-options";

type AddToCartData = z.output<typeof addToCartSchema>;

async function getSellableVariant(variantId: string) {
  const [row] = await db
    .select({ variant: productVariants, product: { id: products.id, categoryId: products.categoryId } })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(productVariants.id, variantId), eq(productVariants.isActive, true), eq(products.status, "published")))
    .limit(1);
  if (!row) throw new AppError("This option is no longer available");
  return row;
}

/** Every chosen add-on must be offered for this product, size and quality (checked on the server). */
async function checkAddons(addonIds: string[], sellable: Awaited<ReturnType<typeof getSellableVariant>>) {
  const options = await listAddonOptionsByIds(addonIds);
  const allOffered =
    options.length === addonIds.length &&
    options.every(
      (addon) => belongsToProduct(addon, sellable.product) && getAddonUnitPrice(addon, sellable.variant) !== null,
    );
  if (!allOffered) throw new AppError("An add-on is not available for this size or quality");
}

/** An existing line with the same variant, custom size and add-ons, if any. */
async function findSameLine(profileId: string, input: AddToCartData) {
  const lines = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity, customLengthIn: cartItems.customLengthIn, customWidthIn: cartItems.customWidthIn })
    .from(cartItems)
    .where(and(eq(cartItems.profileId, profileId), eq(cartItems.variantId, input.variantId)));
  const sameSize = lines.filter(
    (line) => line.customLengthIn === input.customLengthIn && line.customWidthIn === input.customWidthIn,
  );
  if (!sameSize.length) return null;
  const links = await db.select().from(cartItemAddons).where(inArray(cartItemAddons.cartItemId, sameSize.map((line) => line.id)));
  const wanted = [...input.addonIds].sort().join(",");
  return (
    sameSize.find(
      (line) => links.filter((link) => link.cartItemId === line.id).map((link) => link.addonId).sort().join(",") === wanted,
    ) ?? null
  );
}

/** Adds a line, or adds 1 to the same line if it is already in the cart. */
export async function addToCart(profileId: string, input: AddToCartData): Promise<void> {
  const sellable = await getSellableVariant(input.variantId);
  await checkAddons(input.addonIds, sellable);
  const sameLine = await findSameLine(profileId, input);
  if (sameLine) {
    if (sameLine.quantity >= CART_QUANTITY_MAX) throw new AppError(`You can add at most ${CART_QUANTITY_MAX} of one item`);
    await db.update(cartItems).set({ quantity: sql`${cartItems.quantity} + 1` }).where(eq(cartItems.id, sameLine.id));
    return;
  }
  const cartItemId = crypto.randomUUID();
  const insertLine = db.insert(cartItems).values({
    id: cartItemId, profileId, variantId: input.variantId,
    customLengthIn: input.customLengthIn, customWidthIn: input.customWidthIn,
  });
  if (!input.addonIds.length) {
    await insertLine;
    return;
  }
  await db.batch([
    insertLine,
    db.insert(cartItemAddons).values(input.addonIds.map((addonId) => ({ cartItemId, addonId }))),
  ]);
}

export async function setCartQuantity(profileId: string, cartItemId: string, quantity: number): Promise<void> {
  const updated = await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.profileId, profileId)))
    .returning({ id: cartItems.id });
  if (!updated.length) throw new AppError("This item is no longer in your cart");
}

export async function removeCartItem(profileId: string, cartItemId: string): Promise<void> {
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.profileId, profileId)));
}

export async function clearCart(profileId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.profileId, profileId));
}
