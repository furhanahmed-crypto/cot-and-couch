/** Who a profile is. Staff = admin or team. */
export const USER_ROLES = ["admin", "team", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = { admin: "Admin", team: "Team", customer: "Customer" };

/** What each staff role can do, shown on the Team screen. */
export const STAFF_ROLE_HELP: Record<"admin" | "team", string> = {
  admin: "Everything, including categories, store details and team.",
  team: "Dashboard, products (no delete), orders, leads and media.",
};
