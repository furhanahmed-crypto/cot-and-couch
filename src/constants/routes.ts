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
    products: "/admin/products",
    newProduct: "/admin/products/new",
    product: (id: string, tab?: string) => (tab ? `/admin/products/${id}?tab=${tab}` : `/admin/products/${id}`),
    categories: "/admin/categories",
    category: (id: string, tab?: string) => (tab ? `/admin/categories/${id}?tab=${tab}` : `/admin/categories/${id}`),
    colours: "/admin/colours",
    collections: "/admin/collections",
    orders: "/admin/orders",
    newOrder: "/admin/orders/new",
    order: (id: string) => `/admin/orders/${id}`,
    leads: "/admin/leads",
    /** Opens the lead's side sheet on the Leads screen. */
    lead: (id: string) => `/admin/leads?lead=${id}`,
    media: "/admin/media",
    settings: "/admin/settings",
    team: "/admin/team",
  },
} as const;

export const STORAGE_KEYS = {
  recentlyViewed: "cc_recently_viewed",
  lastBrowse: "cc_last_browse",
} as const;
