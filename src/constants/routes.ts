export const ROUTES = {
  home: "/",
  login: "/login",
  verify: "/verify",
  register: "/register",
  catalogue: "/catalogue",
  category: (slug: string) => `/catalogue/${slug}`,
  product: (slug: string, rangeSlug?: string | null) =>
    rangeSlug ? `/product/${slug}?range=${rangeSlug}` : `/product/${slug}`,
  collection: (slug: string) => `/collections/${slug}`,
  shortlist: "/shortlist",
  cart: "/cart",
  search: "/search",
  orders: "/my-orders",
  privacy: "/privacy",
  admin: {
    root: "/admin",
    dashboard: "/admin",
    categories: "/admin/categories",
    brands: "/admin/brands",
    products: "/admin/products",
    productEdit: (id: string) => `/admin/products/${id}`,
    gallery: "/admin/gallery",
    reels: "/admin/reels",
    orders: "/admin/orders",
    leads: "/admin/leads",
    team: "/admin/team",
    settings: "/admin/settings",
  },
} as const;

export const STORAGE_KEYS = {
  recentlyViewed: "cc_recently_viewed",
  lastBrowse: "cc_last_browse",
} as const;
