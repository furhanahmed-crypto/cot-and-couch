import { and, asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartLineAddons } from "@/db";
import { getCurrentProfile } from "@/lib/auth/profile";
import { sameAddonSet, sameCustomSize } from "@/lib/cart-find";
import { getProductById } from "@/services/catalogue";
import type { CartLine, CartLineAddon, CartSummaryLine } from "@/types/cart";

export async function requireCartProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false as const, error: "Sign in required", profile: null };
  }
  return { ok: true as const, profile, error: undefined };
}

async function addonIdsByCartLine(cartLineIds: string[]) {
  const map = new Map<string, string[]>();
  if (!cartLineIds.length) return map;
  const rows = await db
    .select({
      cartLineId: cartLineAddons.cartLineId,
      addonId: cartLineAddons.addonId,
    })
    .from(cartLineAddons)
    .where(inArray(cartLineAddons.cartLineId, cartLineIds));
  for (const row of rows) {
    const list = map.get(row.cartLineId) ?? [];
    list.push(row.addonId);
    map.set(row.cartLineId, list);
  }
  return map;
}

async function addonSnapshotsByCartLine(cartLineIds: string[]) {
  const map = new Map<string, CartLineAddon[]>();
  if (!cartLineIds.length) return map;
  const rows = await db
    .select({
      cartLineId: cartLineAddons.cartLineId,
      addonId: cartLineAddons.addonId,
      label: cartLineAddons.labelSnapshot,
      price: cartLineAddons.priceSnapshot,
    })
    .from(cartLineAddons)
    .where(inArray(cartLineAddons.cartLineId, cartLineIds));
  for (const row of rows) {
    const list = map.get(row.cartLineId) ?? [];
    list.push({
      addonId: row.addonId,
      label: row.label,
      price: Number(row.price),
    });
    map.set(row.cartLineId, list);
  }
  return map;
}

export async function findMatchingCartLine(
  profileId: string,
  variantId: string,
  customLengthIn: number | null,
  customWidthIn: number | null,
  addonIds: string[] = [],
) {
  const rows = await db
    .select()
    .from(carts)
    .where(
      and(eq(carts.profileId, profileId), eq(carts.variantId, variantId)),
    );

  const candidates = rows.filter((row) =>
    sameCustomSize(row, customLengthIn, customWidthIn),
  );
  if (!candidates.length) return null;

  const addonMap = await addonIdsByCartLine(candidates.map((r) => r.id));
  return (
    candidates.find((row) =>
      sameAddonSet(addonMap.get(row.id) ?? [], addonIds),
    ) ?? null
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

  const rows = await db
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

  const addonMap = await addonIdsByCartLine(rows.map((r) => r.id));
  return rows.map((row) => ({
    ...row,
    addonIds: addonMap.get(row.id) ?? [],
  }));
}

export async function listCartItems(): Promise<CartLine[]> {
  const summary = await listCartSummary();
  const addonSnap = await addonSnapshotsByCartLine(summary.map((r) => r.id));
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
      addons: addonSnap.get(row.id) ?? [],
      product,
      variant,
    });
  }

  return lines;
}
