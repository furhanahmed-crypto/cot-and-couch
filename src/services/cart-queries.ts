import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { carts } from "@/db/schema";
import { getCurrentProfile } from "@/lib/auth/profile";
import { sameCustomSize } from "@/lib/cart-find";
import { getProductById } from "@/services/catalogue";
import type { CartLine, CartSummaryLine } from "@/types/cart";

export async function requireCartProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false as const, error: "Sign in required", profile: null };
  }
  return { ok: true as const, profile, error: undefined };
}

export async function findMatchingCartLine(
  profileId: string,
  variantId: string,
  customLengthIn: number | null,
  customWidthIn: number | null,
) {
  const rows = await db
    .select()
    .from(carts)
    .where(
      and(eq(carts.profileId, profileId), eq(carts.variantId, variantId)),
    );

  return (
    rows.find((row) => sameCustomSize(row, customLengthIn, customWidthIn)) ??
    null
  );
}

/** Number of distinct cart lines (not total quantity). */
export async function getCartCountForCurrentUser() {
  const profile = await getCurrentProfile();
  if (!profile) return 0;

  const rows = await db
    .select({ total: count() })
    .from(carts)
    .where(eq(carts.profileId, profile.id));

  return Number(rows[0]?.total ?? 0);
}

export async function listCartSummary(): Promise<CartSummaryLine[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  return db
    .select({
      id: carts.id,
      productId: carts.productId,
      variantId: carts.variantId,
      quantity: carts.quantity,
      customLengthIn: carts.customLengthIn,
      customWidthIn: carts.customWidthIn,
    })
    .from(carts)
    .where(eq(carts.profileId, profile.id))
    .orderBy(asc(carts.createdAt));
}

export async function listCartItems(): Promise<CartLine[]> {
  const summary = await listCartSummary();
  const lines: CartLine[] = [];

  for (const row of summary) {
    const product = await getProductById(row.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === row.variantId);
    if (!variant) continue;
    lines.push({
      id: row.id,
      quantity: row.quantity,
      customLengthIn: row.customLengthIn,
      customWidthIn: row.customWidthIn,
      product,
      variant,
    });
  }

  return lines;
}
