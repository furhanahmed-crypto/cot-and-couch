/** Who a profile is. Staff = admin or team. */
export const USER_ROLES = ["admin", "team", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];
