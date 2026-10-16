import { PageHeader } from "@/components/admin/page-header";
import { LeadsManager } from "@/components/admin/leads-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeads, getSegments } from "@/services/ops";

export default async function LeadsPage() {
  const [leads, segments] = await Promise.all([getLeads(), getSegments()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="CRM leads — edit intent, follow-up, or remove. Segments listed below (PDF AD-11)."
      />
      <LeadsManager leads={leads} />
      <div>
        <h2 className="font-heading mb-3 text-lg">Segments</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {segments.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{s.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.description} · {s.count} leads
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
