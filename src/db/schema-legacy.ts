import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import {
  intentScoreEnum,
  orderStatusEnum,
  productStatusEnum,
  userRoleEnum,
} from "./schema-enums";
export {
  intentScoreEnum,
  orderStatusEnum,
  productStatusEnum,
  userRoleEnum,
} from "./schema-enums";

/**
 * App identity row (1:1 with Neon Auth user).
 * Phone / OTP columns are ready for a later SMS provider — unused for now.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone").unique(),
  phoneCountryCode: text("phone_country_code").default("91"),
  phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
  otpProvider: text("otp_provider"),
  otpProviderRef: text("otp_provider_ref"),
  lastOtpSentAt: timestamp("last_otp_sent_at", { withTimezone: true }),
  privacyConsentAt: timestamp("privacy_consent_at", { withTimezone: true }),
  whatsappOffers: boolean("whatsapp_offers").notNull().default(false),
  area: text("area"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Shop categories: mattresses, cots, sofas, computer-tables */
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Mattress brands only. House-made categories leave mattress_brand_id null. */
export const mattressBrands = pgTable("mattress_brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  /** Brand defaults shown in Categories → brand sheet (warranty, trial, etc.). */
  defaults: jsonb("defaults")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Filter / attribute groups admin can edit.
 * Keys: purpose, size_group, thickness, cover_material, filling, comfort, colour
 */
export const optionGroups = pgTable("option_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** Values inside a group (e.g. purpose → Sleeping / Pain relief). */
export const options = pgTable(
  "options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => optionGroups.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    slug: text("slug").notNull(),
    /** Only for colour options */
    hex: text("hex"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [unique("options_group_slug").on(t.groupId, t.slug)],
);

/**
 * Which catalogue options a mattress brand offers
 * (purpose / comfort / filling / cover_material).
 */
export const mattressBrandOptions = pgTable(
  "mattress_brand_options",
  {
    brandId: uuid("brand_id")
      .notNull()
      .references(() => mattressBrands.id, { onDelete: "cascade" }),
    optionId: uuid("option_id")
      .notNull()
      .references(() => options.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.brandId, t.optionId] })],
);

/**
 * Fixed inch sizes under Single / Diwan / Queen / King.
 * Custom size = no row here; customer enters L×W later on enquiry.
 */
export const sizeDimensions = pgTable(
  "size_dimensions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sizeGroupOptionId: uuid("size_group_option_id")
      .notNull()
      .references(() => options.id, { onDelete: "cascade" }),
    lengthIn: integer("length_in").notNull(),
    widthIn: integer("width_in").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => [
    unique("size_dimensions_unique").on(
      t.sizeGroupOptionId,
      t.lengthIn,
      t.widthIn,
    ),
  ],
);

/**
 * Product = sellable model.
 * Mattress: mattressBrandId required. Cot / sofa / table: null (house-made).
 */
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  mattressBrandId: uuid("mattress_brand_id").references(() => mattressBrands.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  purposeOptionId: uuid("purpose_option_id").references(() => options.id),
  coverMaterialOptionId: uuid("cover_material_option_id").references(
    () => options.id,
  ),
  fillingOptionId: uuid("filling_option_id").references(() => options.id),
  comfortOptionId: uuid("comfort_option_id").references(() => options.id),
  imageUrl: text("image_url"),
  /**
   * Flexible category fields (warranty, beds wood type, sofa foam, etc.).
   * Keys are slugified template labels or fixed mattress keys.
   */
  attributes: jsonb("attributes")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  status: productStatusEnum("status").notNull().default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Variant = priced SKU (size + dimension + thickness + colour).
 * is_custom_size=true → size_dimension_id null; L×W collected at enquiry.
 */
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    sizeGroupOptionId: uuid("size_group_option_id")
      .notNull()
      .references(() => options.id),
    sizeDimensionId: uuid("size_dimension_id").references(
      () => sizeDimensions.id,
    ),
    isCustomSize: boolean("is_custom_size").notNull().default(false),
    thicknessOptionId: uuid("thickness_option_id").references(() => options.id),
    colourOptionId: uuid("colour_option_id").references(() => options.id),
    mrp: numeric("mrp", { precision: 12, scale: 2 }).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    stockQty: integer("stock_qty").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

/** Logged-in customer shortlist (login is required for the shop). */
export const profileFavourites = pgTable(
  "profile_favourites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [unique("profile_favourites_unique").on(t.profileId, t.productId)],
);

/**
 * One row = one cart line for a logged-in user.
 * Custom length/width are set only when the chosen variant is custom size.
 */
export const carts = pgTable("carts", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  customLengthIn: integer("custom_length_in"),
  customWidthIn: integer("custom_width_in"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type MattressBrand = typeof mattressBrands.$inferSelect;
export type OptionGroup = typeof optionGroups.$inferSelect;
export type Option = typeof options.$inferSelect;
export type SizeDimension = typeof sizeDimensions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProfileFavourite = typeof profileFavourites.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

/** Marketing collections (Royal Range, Everyday, …). */
export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const productCollections = pgTable(
  "product_collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
  },
  (t) => [unique("product_collections_unique").on(t.productId, t.collectionId)],
);

/** Single-row store settings for footer / WhatsApp / privacy. */
export const storeSettings = pgTable("store_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  mapUrl: text("map_url").notNull(),
  timings: text("timings").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  privacyNotice: text("privacy_notice").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const galleryItems = pgTable("gallery_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  imageUrl: text("image_url").notNull(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  area: text("area").notNull(),
  deliveryMonth: text("delivery_month").notNull(),
  approved: boolean("approved").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reels = pgTable("reels", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  coverUrl: text("cover_url").notNull(),
  videoUrl: text("video_url").notNull(),
  instagramUrl: text("instagram_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  mobile: text("mobile").notNull(),
  name: text("name").notNull(),
  area: text("area"),
  profileId: uuid("profile_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  intent: intentScoreEnum("intent").notNull().default("cold"),
  assignedToProfileId: uuid("assigned_to_profile_id").references(
    () => profiles.id,
    { onDelete: "set null" },
  ),
  whatsappOffers: boolean("whatsapp_offers").notNull().default(false),
  viewedProductIds: jsonb("viewed_product_ids").$type<string[]>().notNull().default([]),
  shortlistedIds: jsonb("shortlisted_ids").$type<string[]>().notNull().default([]),
  ctaTaps: jsonb("cta_taps")
    .$type<{ type: string; productId?: string; at: string }[]>()
    .notNull()
    .default([]),
  followUpDone: boolean("follow_up_done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerMobile: text("customer_mobile").notNull(),
  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),
  productId: uuid("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  quantity: integer("quantity").notNull().default(1),
  agreedPrice: numeric("agreed_price", { precision: 12, scale: 2 }).notNull(),
  advancePaid: numeric("advance_paid", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  expectedDelivery: text("expected_delivery"),
  salespersonName: text("salesperson_name"),
  status: orderStatusEnum("status").notNull().default("confirmed"),
  deliveryPhotoUrl: text("delivery_photo_url"),
  notificationFailed: boolean("notification_failed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  byName: text("by_name"),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  at: timestamp("at", { withTimezone: true }).defaultNow().notNull(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
});

export const segments = pgTable("segments", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  count: integer("count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export type Collection = typeof collections.$inferSelect;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type Reel = typeof reels.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Segment = typeof segments.$inferSelect;
