import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function StockRedirectPage() {
  redirect(ROUTES.admin.products);
}
