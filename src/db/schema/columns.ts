import { numeric, timestamp, uuid } from "drizzle-orm/pg-core";

/** `id uuid primary key default gen_random_uuid()` */
export const id = () => uuid("id").primaryKey().defaultRandom();

/** Rupees, 2 decimals. Drizzle returns a string: convert with `toRupees`. */
export const money = (name: string) => numeric(name, { precision: 12, scale: 2 });

/** `updated_at` is set by the `set_updated_at()` trigger, never by app code. */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
