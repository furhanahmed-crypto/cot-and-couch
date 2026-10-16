import { PageHeader } from "@/components/admin/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAuditLogs } from "@/services/ops";

export default async function AuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description="audit_logs from Neon." />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap text-xs">
                  {new Date(log.at).toLocaleString("en-IN")}
                </TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell>{log.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
