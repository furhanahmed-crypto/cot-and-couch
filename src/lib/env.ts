/** Client-safe flag: show dev-only helpers (e.g. admin credential popup). */
export const isDevMode =
  process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEV_MODE === "1";
