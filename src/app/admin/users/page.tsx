import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function UsersRedirectPage() {
  redirect(ROUTES.admin.team);
}
