import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getStaffProfile } from "@/services/auth/require-profile";

export const metadata: Metadata = {
  title: "Team console",
};

/** Staff console is request-time (auth + live DB); skip instant-nav validation. */
export const instant = false;

/** Non-staff are sent to the shop before anything renders. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const profile = await getStaffProfile();
  if (!profile) redirect(ROUTES.home);
  return <div className="min-h-dvh bg-background">{children}</div>;
}
