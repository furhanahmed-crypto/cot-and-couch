import { pgEnum } from "drizzle-orm/pg-core";

/** Shared Postgres enums (legacy + coc_*). */
export const userRoleEnum = pgEnum("user_role", ["admin", "team", "customer"]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "published",
  "archived",
]);

export const intentScoreEnum = pgEnum("intent_score", ["hot", "warm", "cold"]);

export const orderStatusEnum = pgEnum("order_status", [
  "confirmed",
  "in_production",
  "out_for_delivery",
  "delivered",
  "closed",
  "issue",
]);
