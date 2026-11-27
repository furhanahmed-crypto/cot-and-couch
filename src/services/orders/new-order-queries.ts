import { and, asc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { addonPrices, addons, colours, productVariants, products, profiles, qualities } from "@/db/schema";
import { toRupees } from "@/lib/money";
import { belongsToProduct, getAddonUnitPrice } from "@/lib/pricing";
import { escapeLikePattern } from "@/services/catalogue/product-card-queries";
import type { CustomerMatch, OrderVariantOption } from "@/types/admin-orders";

const CUSTOMER_MATCHES = 8;

/** Customer accounts by name, email or phone, for the "New order" form. */
export async function searchCustomers(query: string): Promise<CustomerMatch[]> {
  const pattern = `%${escapeLikePattern(query)}%`;
  const digits = query.replace(/\D/g, "");
  const rows = await db
    .select({ profileId: profiles.id, name: profiles.name, email: profiles.email, phone: profiles.phone, address: profiles.address })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, "customer"),
        or(ilike(profiles.name, pattern), ilike(profiles.email, pattern), digits ? ilike(profiles.phone, `%${digits}%`) : undefined),
      ),
    )
    .orderBy(asc(profiles.name))
    .limit(CUSTOMER_MATCHES);
  return rows.map((row) => ({ ...row, name: row.name ?? row.email }));
}

function variantLabel(row: { sizeLabel: string; qualityName: string | null; colourName: string | null; thicknessIn: number | null }) {
  return [row.sizeLabel, row.thicknessIn ? `${row.thicknessIn} in` : null, row.qualityName, row.colourName].filter(Boolean).join(" · ");
}

async function listProductAddons(product: { id: string; categoryId: string }) {
  const addonRows = await db.select().from(addons).where(eq(addons.categoryId, product.categoryId)).orderBy(asc(addons.sortOrder));
  const offered = addonRows.filter((addon) => belongsToProduct(addon, product));
  if (!offered.length) return [];
  const priceRows = await db.select().from(addonPrices).where(inArray(addonPrices.addonId, offered.map((addon) => addon.id)));
  return offered.map((addon) => ({
    ...addon,
    prices: Object.fromEntries(priceRows.filter((row) => row.addonId === addon.id).map((row) => [row.qualityId, toRupees(row.price)])),
  }));
}

/** Active variants of one product, each with the add-ons offered for it and their price. */
export async function listOrderVariantOptions(productId: string): Promise<OrderVariantOption[]> {
  const [product] = await db
    .select({ id: products.id, categoryId: products.categoryId })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.status, "published")));
  if (!product) return [];
  const [variantRows, productAddons] = await Promise.all([
    db
      .select({
        id: productVariants.id, sku: productVariants.sku, sizeLabel: productVariants.sizeLabel, thicknessIn: productVariants.thicknessIn,
        seats: productVariants.seats, qualityId: productVariants.qualityId, price: productVariants.price,
        qualityName: qualities.name, colourName: colours.name,
      })
      .from(productVariants)
      .leftJoin(qualities, eq(qualities.id, productVariants.qualityId))
      .leftJoin(colours, eq(colours.id, productVariants.colourId))
      .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
      .orderBy(asc(productVariants.sortOrder), asc(productVariants.price)),
    listProductAddons(product),
  ]);
  return variantRows.map((row) => ({
    id: row.id,
    label: variantLabel(row),
    sku: row.sku,
    price: toRupees(row.price),
    addons: productAddons.flatMap((addon) => {
      const unitPrice = getAddonUnitPrice(addon, row);
      return unitPrice === null ? [] : [{ id: addon.id, name: addon.name, unitPrice }];
    }),
  }));
}
