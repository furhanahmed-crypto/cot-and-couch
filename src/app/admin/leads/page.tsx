"use client";

import { Download } from "lucide-react";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leads as seedLeads } from "@/data/mock";
import { mockToast } from "@/lib/admin-mock";
import { useStaffSession } from "@/hooks/use-staff-session";
import type { IntentScore } from "@/types";

function intentVariant(intent: IntentScore) {
  if (intent === "hot") return "default";
  if (intent === "warm") return "secondary";
  return "outline";
}

export default function LeadsPage() {
  const { session, isAdmin } = useStaffSession();
  const visible = isAdmin
    ? seedLeads
    : seedLeads.filter((l) => l.assignedTo === session?.id);

  function exportCsv() {
    mockToast("CSV export simulated — no file written");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={
          isAdmin
            ? "All leads from mock CRM seed."
            : "Showing leads assigned to you only (mock filter)."
        }
        action={
          isAdmin ? (
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="size-4" />
              Export CSV (mock)
            </Button>
          ) : undefined
        }
      />
      <MockBanner compact />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead>CTAs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>{l.mobile}</TableCell>
                <TableCell>{l.area ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={intentVariant(l.intent)} className="capitalize">
                    {l.intent}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.lastSeen}</TableCell>
                <TableCell>{l.ctaTaps.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!isAdmin && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">No assigned leads in mock data for this user.</p>
      )}
    </div>
  );
}
