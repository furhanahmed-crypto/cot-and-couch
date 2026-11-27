import { z } from "zod";
import { USER_ROLES } from "@/constants/users";
import { idSchema } from "./common";

/** "customer" removes staff access. */
export const roleChangeSchema = z.object({
  profileId: idSchema,
  role: z.enum(USER_ROLES, { error: "Choose a role" }),
});
export type RoleChangeInput = z.input<typeof roleChangeSchema>;
