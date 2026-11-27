export const ROUTES = {
  home: "/",
  login: "/login",
  verify: "/verify",
  register: "/register",
  catalogue: "/catalogue",
  category: (slug: string) => `/catalogue/${slug}`,
  /** With a quality id, the product page opens on that quality. */
  product: (slug: string, qualityId?: string | null) =>
    qualityId ? `/product/${slug}?quality=${qualityId}` : `/product/${slug}`,
  collection: (slug: string) => `/collections/${slug}`,
  shortlist: "/shortlist",
  cart: "/cart",
  search: "/search",
  orders: "/my-orders",
  privacy: "/privacy",
  admin: {
    root: "/admin",
  },
} as const;

export const STORAGE_KEYS = {
  recentlyViewed: "cc_recently_viewed",
  lastBrowse: "cc_last_browse",
} as const;
