"use server";

import { getProductsByIds, searchProducts } from "@/services/catalogue";

export async function getProductsByIdsAction(ids: string[]) {
  return getProductsByIds(ids);
}

export async function searchProductsAction(q: string) {
  return searchProducts(q);
}
