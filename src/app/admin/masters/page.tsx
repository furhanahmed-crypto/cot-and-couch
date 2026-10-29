import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function MastersRedirectPage() {
  redirect(ROUTES.admin.brands);
}
