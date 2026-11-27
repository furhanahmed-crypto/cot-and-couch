import Link from "next/link";
import { Flame } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/common/data-table";
import { EmptyState } from "@/components/admin/common/empty-state";
import { ROUTES } from "@/constants/routes";
import { formatDate, formatPhone } from "@/lib/format";
import type { HotLead } from "@/types/dashboard";

const COLUMNS: DataTableColumn<HotLead>[] = [
  {
    key: "name",
    header: "Lead",
    cell: (lead) => (
      <Link href={ROUTES.admin.lead(lead.id)} className="font-medium hover:text-brass">
        {lead.name}
        {lead.area ? <span className="block text-xs font-normal text-muted-foreground">{lead.area}</span> : null}
      </Link>
    ),
  },
  {
    key: "phone",
    header: "Phone",
    cell: (lead) =>
      lead.phone ? (
        <a href={`tel:${lead.phone}`} className="tabular-nums hover:text-brass">
          {formatPhone(lead.phone)}
        </a>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "seen",
    header: "Last seen",
    align: "right",
    cell: (lead) => <span className="text-xs text-muted-foreground">{formatDate(lead.lastSeenAt)}</span>,
  },
];

export function HotLeadsPanel({ leads }: { leads: HotLead[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Hot leads to follow up</h2>
        <Link href={`${ROUTES.admin.leads}?intent=hot`} className="text-sm text-muted-foreground hover:text-foreground">
          All leads
        </Link>
      </div>
      <DataTable
        columns={COLUMNS}
        rows={leads}
        getRowKey={(lead) => lead.id}
        emptyState={<EmptyState icon={Flame} title="No hot leads waiting" description="Leads marked hot and not followed up appear here." />}
      />
    </section>
  );
}
