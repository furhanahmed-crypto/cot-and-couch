import { pgEnum } from "drizzle-orm/pg-core";
import { LEAD_EVENT_TYPES, LEAD_INTENTS } from "@/constants/leads";
import { MEDIA_TYPES } from "@/constants/media";
import { ORDER_STATUSES } from "@/constants/orders";
import { ADDON_KINDS, PRICE_UNITS, PRODUCT_STATUSES } from "@/constants/products";
import { USER_ROLES } from "@/constants/users";

// Each enum is built from the constants array, so values live in one place.
export const userRoleEnum = pgEnum("user_role", USER_ROLES);
export const productStatusEnum = pgEnum("product_status", PRODUCT_STATUSES);
export const orderStatusEnum = pgEnum("order_status", ORDER_STATUSES);
export const leadIntentEnum = pgEnum("lead_intent", LEAD_INTENTS);
export const leadEventTypeEnum = pgEnum("lead_event_type", LEAD_EVENT_TYPES);
export const addonKindEnum = pgEnum("addon_kind", ADDON_KINDS);
export const priceUnitEnum = pgEnum("price_unit", PRICE_UNITS);
export const mediaTypeEnum = pgEnum("media_type", MEDIA_TYPES);
