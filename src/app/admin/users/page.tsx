"use client";

import { AdminGate } from "@/components/admin/admin-gate";
import { MockBanner } from "@/components/admin/mock-banner";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { staffUsers } from "@/data/mock";

export default function UsersPage() {
  return (
    <AdminGate title="Staff users">
      <div className="space-y-6">
        <PageHeader title="Staff users" description="Mock directory — not editable in prototype." />
        <MockBanner compact />
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.mobile}</TableCell>
                  <TableCell>
                    <Badge className="capitalize">{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.active ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminGate>
  );
}
