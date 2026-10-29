import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function SalesRedirectPage() {
  redirect(ROUTES.admin.orders);
}
