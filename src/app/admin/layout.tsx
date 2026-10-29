import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ROUTES } from "@/constants/routes";
import { getStaffProfile } from "@/services/profile";

export const metadata: Metadata = {
  title: "Team console",
};

/** Staff console is request-time (auth + live DB); skip instant-nav validation. */
export const instant = false;

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const profile = await getStaffProfile();
  if (!profile) {
    redirect(ROUTES.home);
  }

  return (
    <AdminShell
      staffName={profile.name?.trim() || profile.email}
      isAdmin={profile.role === "admin"}
    >
      {children}
    </AdminShell>
  );
}
