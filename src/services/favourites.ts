import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { profileFavourites } from "@/db";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getProductsByIds } from "@/services/catalogue";

export async function listFavouriteIds(profileId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: profileFavourites.productId })
    .from(profileFavourites)
    .where(eq(profileFavourites.profileId, profileId))
    .orderBy(desc(profileFavourites.createdAt));
  return rows.map((r) => r.productId);
}

export async function listFavouriteProducts() {
  const profile = await getCurrentProfile();
  if (!profile) return [];
  const ids = await listFavouriteIds(profile.id);
  return getProductsByIds(ids);
}

export async function isFavourite(
  profileId: string,
  productId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: profileFavourites.id })
    .from(profileFavourites)
    .where(
      and(
        eq(profileFavourites.profileId, profileId),
        eq(profileFavourites.productId, productId),
      ),
    )
    .limit(1);
  return Boolean(rows[0]);
}

/** Toggle favourite. Returns the new liked state. */
export async function toggleFavourite(productId: string): Promise<{
  ok: boolean;
  liked: boolean;
  error?: string;
}> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { ok: false, liked: false, error: "Sign in required" };
  }

  const existing = await db
    .select({ id: profileFavourites.id })
    .from(profileFavourites)
    .where(
      and(
        eq(profileFavourites.profileId, profile.id),
        eq(profileFavourites.productId, productId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .delete(profileFavourites)
      .where(eq(profileFavourites.id, existing[0].id));
    return { ok: true, liked: false };
  }

  await db.insert(profileFavourites).values({
    profileId: profile.id,
    productId,
  });
  return { ok: true, liked: true };
}

export async function getFavouriteIdsForCurrentUser(): Promise<string[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];
  return listFavouriteIds(profile.id);
}
