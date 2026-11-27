"use server";

import { revalidatePath } from "next/cache";
import { ROUTES } from "@/constants/routes";
import { actionOk, toActionError, validationError } from "@/lib/action-result";
import { getCurrentProfile } from "@/lib/auth/profile";
import { requireProfile } from "@/services/auth/require-profile";
import { addToCart, clearCart, removeCartItem, setCartQuantity } from "@/services/cart/mutations";
import { countCartLines } from "@/services/cart/queries";
import type { ActionResult } from "@/types/action";
import { addToCartSchema, cartQuantitySchema, idSchema, type AddToCartInput } from "@/validation/shop";

type CartCount = { cartCount: number };

export async function addToCartAction(input: AddToCartInput): Promise<ActionResult<CartCount>> {
  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const profile = await requireProfile();
    await addToCart(profile.id, parsed.data);
    revalidatePath(ROUTES.cart);
    return actionOk({ cartCount: await countCartLines(profile.id) });
  } catch (error) {
    return toActionError(error, "Could not add to cart");
  }
}

export async function setCartQuantityAction(cartItemId: string, quantity: number): Promise<ActionResult> {
  const parsed = cartQuantitySchema.safeParse({ cartItemId, quantity });
  if (!parsed.success) return validationError(parsed.error);
  try {
    const profile = await requireProfile();
    await setCartQuantity(profile.id, parsed.data.cartItemId, parsed.data.quantity);
  } catch (error) {
    return toActionError(error, "Could not change the quantity");
  }
  revalidatePath(ROUTES.cart);
  return actionOk();
}

export async function removeCartItemAction(cartItemId: string): Promise<ActionResult<CartCount>> {
  const parsed = idSchema.safeParse(cartItemId);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const profile = await requireProfile();
    await removeCartItem(profile.id, parsed.data);
    revalidatePath(ROUTES.cart);
    return actionOk({ cartCount: await countCartLines(profile.id) });
  } catch (error) {
    return toActionError(error, "Could not remove the item");
  }
}

export async function clearCartAction(): Promise<ActionResult> {
  try {
    const profile = await requireProfile();
    await clearCart(profile.id);
  } catch (error) {
    return toActionError(error, "Could not clear the cart");
  }
  revalidatePath(ROUTES.cart);
  return actionOk();
}

/** Header badge. Guests have 0. */
export async function getCartCountAction(): Promise<number> {
  const profile = await getCurrentProfile();
  return profile ? countCartLines(profile.id) : 0;
}
