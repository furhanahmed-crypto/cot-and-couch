import { UserRound } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/common/admin-page-header";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { StatusBadge } from "@/components/admin/common/status-badge";
import { TablePagination } from "@/components/admin/common/table-pagination";
import { LeadOpenLink } from "@/components/admin/leads/lead-open-link";
import { LeadSheet } from "@/components/admin/leads/lead-sheet";
import { LeadsToolbar } from "@/components/admin/leads/leads-toolbar";
import { LEAD_INTENT_LABELS, LEAD_INTENT_TONES } from "@/constants/leads";
import { formatDate, formatPhone } from "@/lib/format";
import { parseLeadAdminFilters, parseOpenLeadId } from "@/lib/lead-admin-params";
import { getStaffProfile, isAdmin } from "@/services/auth/require-staff";
import { getLeadForAdmin, listLeadsForAdmin } from "@/services/leads/admin-queries";
import { listStaffOptions } from "@/services/users/staff-queries";
import type { LeadAdminRow } from "@/types/admin-leads";

const COLUMNS: DataTableColumn<LeadAdminRow>[] = [
  { key: "name", header: "Name", cell: (row) => <LeadOpenLink leadId={row.id} name={row.name} /> },
  { key: "phone", header: "Phone", cell: (row) => <span className="whitespace-nowrap">{row.phone ? formatPhone(row.phone) : "—"}</span> },
  { key: "area", header: "Area", cell: (row) => <span className="block max-w-40 truncate" title={row.area ?? undefined}>{row.area ?? "—"}</span> },
  { key: "intent", header: "Intent", cell: (row) => <StatusBadge label={LEAD_INTENT_LABELS[row.intent]} tone={LEAD_INTENT_TONES[row.intent]} /> },
  { key: "assigned", header: "Assigned to", cell: (row) => row.assignedToName ?? <span className="text-muted-foreground">—</span> },
  { key: "seen", header: "Last seen", cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.lastSeenAt)}</span> },
  {
    key: "followUp",
    header: "Follow-up",
    cell: (row) => <StatusBadge label={row.followUpDone ? "Done" : "Pending"} tone={row.followUpDone ? "neutral" : "outline"} />,
  },
];

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const params = await searchParams;
  const filters = parseLeadAdminFilters(params);
  const openLeadId = parseOpenLeadId(params);
  const [profile, result, staff, openLead] = await Promise.all([
    getStaffProfile(),
    listLeadsForAdmin(filters),
    listStaffOptions(),
    openLeadId ? getLeadForAdmin(openLeadId) : Promise.resolve(null),
  ]);
  const hasFilters = Boolean(filters.q || filters.intent || filters.assignedTo || filters.followUp);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Leads" description="Customers who signed in to the shop, with what they looked at." />
      <LeadsToolbar staff={staff} />
      <DataTable
        columns={COLUMNS}
        rows={result.items}
        getRowKey={(row) => row.id}
        emptyState={
          <EmptyState
            icon={UserRound}
            title={hasFilters ? "No leads match these filters" : "No leads yet"}
            description={hasFilters ? "Try another search or clear the filters." : "A lead appears when a customer signs in to the shop."}
          />
        }
      />
      <TablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
      {openLead ? <LeadSheet key={openLead.id} lead={openLead} staff={staff} canDelete={profile ? isAdmin(profile) : false} /> : null}
    </div>
  );
}
