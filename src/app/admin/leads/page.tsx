import { PageHeader } from "@/components/admin/page-header";
import { LeadsManager } from "@/components/admin/leads-manager";
import { getAdminLeads } from "@/services/leads";

export const instant = false;

export default async function LeadsPage() {
  const leads = await getAdminLeads();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={`${leads.length} contacts — storefront sign-ups sync here automatically.`}
      />
      <LeadsManager leads={leads} />
    </div>
  );
}
