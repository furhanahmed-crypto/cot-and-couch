import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { carts } from "@/db/schema";
import {
  findMatchingCartLine,
  requireCartProfile,
} from "@/services/cart-queries";
import type { AddToCartInput } from "@/types/cart";

export async function addToCart(input: AddToCartInput) {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  const quantity = Math.max(1, input.quantity ?? 1);
  const customLengthIn = input.customLengthIn ?? null;
  const customWidthIn = input.customWidthIn ?? null;

  const existing = await findMatchingCartLine(
    auth.profile.id,
    input.variantId,
    customLengthIn,
    customWidthIn,
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

  return { ok: true as const, cartId: inserted[0].id };
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
