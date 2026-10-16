"use server";

import { revalidatePath } from "next/cache";
import {
  getFavouriteIdsForCurrentUser,
  toggleFavourite,
} from "@/services/favourites";
import { ROUTES } from "@/constants/routes";

export async function toggleFavouriteAction(productId: string) {
  const result = await toggleFavourite(productId);
  if (result.ok) {
    revalidatePath(ROUTES.shortlist);
    revalidatePath("/");
  }
  return result;
}

export async function getFavouriteIdsAction() {
  return getFavouriteIdsForCurrentUser();
}
