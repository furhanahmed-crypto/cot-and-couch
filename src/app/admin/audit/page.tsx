import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AuditRedirectPage() {
  redirect(ROUTES.admin.dashboard);
}
