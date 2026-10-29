import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { carts } from "@/db";
import { requireCartProfile } from "@/services/cart-queries";

export async function removeFromCart(cartId: string) {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  await db
    .delete(carts)
    .where(and(eq(carts.id, cartId), eq(carts.profileId, auth.profile.id)));

  return { ok: true as const };
}

export async function clearCart() {
  const auth = await requireCartProfile();
  if (!auth.ok || !auth.profile) {
    return { ok: false as const, error: auth.error ?? "Sign in required" };
  }

  await db.delete(carts).where(eq(carts.profileId, auth.profile.id));
  return { ok: true as const };
}
