import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function SegmentsRedirectPage() {
  redirect(ROUTES.admin.leads);
}
