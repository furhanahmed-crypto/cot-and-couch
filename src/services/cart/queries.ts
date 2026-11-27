import { asc, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { cartItemAddons, cartItems, colours, productImages, productVariants, products, qualities } from "@/db/schema";
import { toRupees, toRupeesOrNull } from "@/lib/money";
import { belongsToProduct, getAddonUnitPrice, getUnitTotal } from "@/lib/pricing";
import type { CartLine } from "@/types/cart";
import { listAddonOptionsByIds, type CartAddonOption } from "./addon-options";

type CartRow = Awaited<ReturnType<typeof selectCartRows>>[number];

function selectCartRows(profileId: string) {
  return db
    .select({
      item: cartItems,
      variant: productVariants,
      product: { id: products.id, name: products.name, slug: products.slug, status: products.status, categoryId: products.categoryId },
      qualityName: qualities.name,
      colourName: colours.name,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(qualities, eq(qualities.id, productVariants.qualityId))
    .leftJoin(colours, eq(colours.id, productVariants.colourId))
    .where(eq(cartItems.profileId, profileId))
    .orderBy(asc(cartItems.createdAt));
}

/** Prices are read fresh every time: the cart never stores a price. */
function toCartLine(row: CartRow, chosen: CartAddonOption[], imageUrl: string | null): CartLine {
  const variant = { qualityId: row.variant.qualityId, sizeLabel: row.variant.sizeLabel, seats: row.variant.seats };
  const priced = chosen.map((addon) => ({
    addon,
    unitPrice: belongsToProduct(addon, row.product) ? getAddonUnitPrice(addon, variant) : null,
  }));
  const kept = priced.flatMap(({ addon, unitPrice }) => (unitPrice === null ? [] : [{ id: addon.id, name: addon.name, unitPrice }]));
  const price = toRupees(row.variant.price);
  const unitTotal = getUnitTotal(price, kept.map((addon) => addon.unitPrice));
  return {
    id: row.item.id,
    quantity: row.item.quantity,
    customLengthIn: row.item.customLengthIn,
    customWidthIn: row.item.customWidthIn,
    isAvailable: row.variant.isActive && row.product.status === "published",
    productName: row.product.name,
    productSlug: row.product.slug,
    imageUrl,
    variantId: row.variant.id,
    sku: row.variant.sku,
    sizeLabel: row.variant.sizeLabel,
    lengthIn: row.variant.lengthIn,
    widthIn: row.variant.widthIn,
    thicknessIn: row.variant.thicknessIn,
    qualityId: row.variant.qualityId,
    qualityName: row.qualityName,
    colourName: row.colourName,
    mrp: toRupeesOrNull(row.variant.mrp),
    price,
    addons: kept,
    removedAddonNames: priced.filter((item) => item.unitPrice === null).map((item) => item.addon.name),
    unitTotal,
    lineTotal: unitTotal * row.item.quantity,
  };
}

export async function listCartLines(profileId: string): Promise<CartLine[]> {
  const rows = await selectCartRows(profileId);
  if (!rows.length) return [];
  const [links, images] = await Promise.all([
    db.select().from(cartItemAddons).where(inArray(cartItemAddons.cartItemId, rows.map((row) => row.item.id))),
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, rows.map((row) => row.product.id)))
      .orderBy(asc(productImages.sortOrder)),
  ]);
  const addonOptions = await listAddonOptionsByIds([...new Set(links.map((link) => link.addonId))]);
  return rows.map((row) => {
    const chosenIds = links.filter((link) => link.cartItemId === row.item.id).map((link) => link.addonId);
    const chosen = addonOptions.filter((addon) => chosenIds.includes(addon.id));
    const imageUrl = images.find((image) => image.productId === row.product.id)?.url ?? null;
    return toCartLine(row, chosen, imageUrl);
  });
}

/** Lines that can still be bought: unavailable lines are not counted in totals. */
export function getCartSubtotal(lines: CartLine[]): number {
  return lines.filter((line) => line.isAvailable).reduce((sum, line) => sum + line.lineTotal, 0);
}

export async function countCartLines(profileId: string): Promise<number> {
  const [row] = await db.select({ total: count() }).from(cartItems).where(eq(cartItems.profileId, profileId));
  return row?.total ?? 0;
}
