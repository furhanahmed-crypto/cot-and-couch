import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartLineAddons, categoryAddons, bedRanges, products } from "@/db";
import {
  BED_ADDON_DEFS,
  bedAddonPrice,
  bedRangeAddonTier,
  type BedAddonKey,
} from "@/constants/bed-pricing";
import { sameAddonSet } from "@/lib/cart-find";
import {
  findMatchingCartLine,
  requireCartProfile,
} from "@/services/cart-queries";
import type { AddToCartInput } from "@/types/cart";

async function resolveAddonSnapshots(
  productId: string,
  addonIds: string[],
): Promise<{ addonId: string; labelSnapshot: string; priceSnapshot: string }[]> {
  if (!addonIds.length) return [];

  const [product] = await db
    .select({
      bedRangeId: products.bedRangeId,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  let tier = bedRangeAddonTier("essential-range");
  if (product?.bedRangeId) {
    const [range] = await db
      .select({ slug: bedRanges.slug })
      .from(bedRanges)
      .where(eq(bedRanges.id, product.bedRangeId))
      .limit(1);
    if (range) tier = bedRangeAddonTier(range.slug);
  }

  const rows = await db
    .select()
    .from(categoryAddons)
    .where(inArray(categoryAddons.id, addonIds));

  return rows.map((row) => {
    const key = row.key as BedAddonKey;
    const known = BED_ADDON_DEFS.some((d) => d.key === key);
    const price = known ? bedAddonPrice(tier, key) : Number(row.price);
    return {
      addonId: row.id,
      labelSnapshot: row.label,
      priceSnapshot: String(price),
    };
  });
}

export async function addToCart(input: AddToCartInput) {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  const quantity = Math.max(1, input.quantity ?? 1);
  const customLengthIn = input.customLengthIn ?? null;
  const customWidthIn = input.customWidthIn ?? null;
  const addonIds = [...new Set(input.addonIds ?? [])];

  const existing = await findMatchingCartLine(
    auth.profile.id,
    input.variantId,
    customLengthIn,
    customWidthIn,
    addonIds,
  );

  if (existing) {
    await db
      .update(carts)
      .set({
        quantity: existing.quantity + quantity,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, existing.id));
    return { ok: true as const, cartId: existing.id };
  }

  const inserted = await db
    .insert(carts)
    .values({
      profileId: auth.profile.id,
      productId: input.productId,
      variantId: input.variantId,
      quantity,
      customLengthIn,
      customWidthIn,
    })
    .returning({ id: carts.id });

  const cartId = inserted[0].id;
  const snapshots = await resolveAddonSnapshots(input.productId, addonIds);
  if (snapshots.length) {
    await db.insert(cartLineAddons).values(
      snapshots.map((s) => ({
        cartLineId: cartId,
        addonId: s.addonId,
        labelSnapshot: s.labelSnapshot,
        priceSnapshot: s.priceSnapshot,
      })),
    );
  }

  return { ok: true as const, cartId };
}

export async function increaseCartQuantity(cartId: string) {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  const rows = await db
    .select()
    .from(carts)
    .where(and(eq(carts.id, cartId), eq(carts.profileId, auth.profile.id)))
    .limit(1);

  if (!rows[0]) {
    return { ok: false as const, error: "Cart item not found" };
  }

  const quantity = rows[0].quantity + 1;
  await db
    .update(carts)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return { ok: true as const, quantity };
}

export async function decreaseCartQuantity(cartId: string) {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  const rows = await db
    .select()
    .from(carts)
    .where(and(eq(carts.id, cartId), eq(carts.profileId, auth.profile.id)))
    .limit(1);

  if (!rows[0]) {
    return { ok: false as const, error: "Cart item not found" };
  }

  if (rows[0].quantity <= 1) {
    await db.delete(carts).where(eq(carts.id, cartId));
    return { ok: true as const, quantity: 0, removed: true as const };
  }

  const quantity = rows[0].quantity - 1;
  await db
    .update(carts)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return { ok: true as const, quantity, removed: false as const };
}

/** Exported for tests / matching helpers. */
export { sameAddonSet };
