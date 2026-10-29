/** Application schema — Neon `coc_*` tables (aliases for app code). */
export {
  userRoleEnum,
  productStatusEnum,
  orderStatusEnum,
  intentScoreEnum,
} from "./schema-enums";

export {
  cocProfiles as profiles,
  cocCategories as categories,
  cocStoreSettings as storeSettings,
  type CocProfile as Profile,
  type CocCategory as Category,
  type CocStoreSettings as StoreSettings,
} from "./schema-coc";

export {
  cocCotTypeEnum,
  cocOptionGroups as optionGroups,
  cocOptions as options,
  cocCategoryOptionGroups as categoryOptionGroups,
  cocMattressBrands as mattressBrands,
  cocBedRanges as bedRanges,
  cocBrandOptionLinks as mattressBrandOptions,
  cocSizeDimensions as sizeDimensions,
  cocProducts as products,
  cocProductOptionValues as productOptionValues,
  cocProductVariants as productVariants,
  cocCategoryAddons as categoryAddons,
  cocCollections as collections,
  cocProductCollections as productCollections,
  type CocProduct as Product,
  type CocProductVariant as ProductVariant,
  type CocMattressBrand as MattressBrand,
  type CocBedRange as BedRange,
  type CocOption as Option,
  type CocOptionGroup as OptionGroup,
  type CocSizeDimension as SizeDimension,
} from "./schema-coc-catalogue";

export {
  cocProfileFavourites as profileFavourites,
  cocCartLines as carts,
  cocCartLineAddons as cartLineAddons,
  type CocCartLine as Cart,
} from "./schema-coc-shop";

export {
  cocLeadEventTypeEnum,
  cocLeads as leads,
  cocLeadEvents as leadEvents,
  type CocLead as Lead,
  type CocLeadEvent as LeadEvent,
} from "./schema-coc-crm";

export {
  cocOrders as orders,
  cocOrderLines as orderLines,
  cocOrderLineAddons as orderLineAddons,
  cocOrderStatusHistory as orderStatusHistory,
  cocGalleryItems as galleryItems,
  cocReels as reels,
  type CocOrder as Order,
} from "./schema-coc-commerce";

/** @deprecated Use Profile fields from coc_profiles (address, no OTP columns). */
export type NewProfile = typeof import("./schema-coc").cocProfiles.$inferInsert;
