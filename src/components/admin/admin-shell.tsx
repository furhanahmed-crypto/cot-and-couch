"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AdminShell({
  children,
  staffName,
  isAdmin,
}: {
  children: React.ReactNode;
  staffName: string;
  isAdmin: boolean;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar staffName={staffName} isAdmin={isAdmin} />
      <SidebarInset className="min-w-0 overflow-x-hidden bg-stone">
        <AdminTopbar staffName={staffName} />
        <div className="relative mx-auto w-full min-w-0 max-w-6xl flex-1 px-3 py-4 sm:px-4 md:px-6 md:py-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
