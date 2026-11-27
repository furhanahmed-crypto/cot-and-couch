import { Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { AddStaffButton } from "@/components/admin/team/add-staff-button";
import { TeamRowControls } from "@/components/admin/team/team-row-controls";
import { formatDate } from "@/lib/format";
import { requireAdminPage } from "@/services/auth/require-staff";
import { listTeam } from "@/services/users/team";
import type { StaffMember } from "@/types/admin-content";

function buildColumns(selfId: string): DataTableColumn<StaffMember>[] {
  return [
    { key: "name", header: "Name", cell: (member) => <span className="font-medium">{member.name ?? "—"}</span> },
    { key: "email", header: "Email", cell: (member) => member.email },
    { key: "joined", header: "Joined", cell: (member) => <span className="text-xs text-muted-foreground">{formatDate(member.joinedAt)}</span> },
    { key: "role", header: "Role", align: "right", cell: (member) => <TeamRowControls member={member} isSelf={member.id === selfId} /> },
  ];
}

export default async function TeamPage() {
  const admin = await requireAdminPage();
  const team = await listTeam();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Team" description="Who can open the admin, and what they can change." action={<AddStaffButton />} />
      <DataTable columns={buildColumns(admin.id)} rows={team} getRowKey={(member) => member.id} emptyState={<EmptyState icon={Users} title="No staff yet" />} />
    </div>
  );
}
