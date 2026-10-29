import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function AttributesRedirectPage() {
  redirect(ROUTES.admin.categories);
}
