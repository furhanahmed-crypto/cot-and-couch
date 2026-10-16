import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Segments live under Leads (PDF AD-11) — no separate nav item. */
export default function SegmentsRedirectPage() {
  redirect(ROUTES.admin.leads);
}
