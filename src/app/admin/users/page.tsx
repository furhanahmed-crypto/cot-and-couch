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
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { inArray } from "drizzle-orm";

export default async function UsersPage() {
  const staff = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.role, ["admin", "team"]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff users"
        description="Staff profiles from Neon (role admin / team)."
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No staff profiles yet. Register and set role=admin/team in DB.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u.phone ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
