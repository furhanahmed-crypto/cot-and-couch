/**
 * Cart service barrel — DB is source of truth; Zustand holds the client snapshot.
 */
export type {
  AddToCartInput,
  CartLine,
  CartSummaryLine,
} from "@/types/cart";
export { findSummaryLine, sameCustomSize } from "@/lib/cart-find";
export {
  findMatchingCartLine,
  getCartCountForCurrentUser,
  listCartItems,
  listCartSummary,
  requireCartProfile,
} from "@/services/cart-queries";
export {
  addToCart,
  decreaseCartQuantity,
  increaseCartQuantity,
} from "@/services/cart-mutations";
export { clearCart, removeFromCart } from "@/services/cart-remove";
