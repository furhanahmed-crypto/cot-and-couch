import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function PricingRedirectPage() {
  redirect(ROUTES.admin.products);
}
