"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import {
  addToCart,
  clearCart,
  decreaseCartQuantity,
  increaseCartQuantity,
  listCartSummary,
  removeFromCart,
  type AddToCartInput,
} from "@/services/cart";

function refreshCartPages() {
  revalidatePath(ROUTES.cart);
}

export async function addToCartAction(input: AddToCartInput) {
  const result = await addToCart(input);
  if (result.ok) refreshCartPages();
  return result;
}

export async function increaseCartQuantityAction(cartId: string) {
  const result = await increaseCartQuantity(cartId);
  if (result.ok) refreshCartPages();
  return result;
}

export async function decreaseCartQuantityAction(cartId: string) {
  const result = await decreaseCartQuantity(cartId);
  if (result.ok) refreshCartPages();
  return result;
}

export async function removeFromCartAction(cartId: string) {
  const result = await removeFromCart(cartId);
  if (result.ok) refreshCartPages();
  return result;
}

export async function clearCartAction() {
  const result = await clearCart();
  if (result.ok) refreshCartPages();
  return result;
}

/** One action for header/PDP/cards — returns line rows, not a heavy product hydrate. */
export async function getCartSummaryAction() {
  return listCartSummary();
}
