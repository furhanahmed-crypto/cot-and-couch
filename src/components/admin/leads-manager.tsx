"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteLeadAction,
  updateLeadAction,
} from "@/app/admin/ops/actions";
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
import type { Lead } from "@/types";

export function LeadsManager({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Intent</TableHead>
            <TableHead>Follow-up</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.name}</TableCell>
              <TableCell>{l.mobile}</TableCell>
              <TableCell>
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm capitalize"
                  value={l.intent}
                  disabled={pending}
                  onChange={(e) => {
                    const intent = e.target.value as Lead["intent"];
                    startTransition(async () => {
                      await updateLeadAction({
                        id: l.id,
                        intent,
                        followUpDone: l.followUpDone,
                      });
                      router.refresh();
                    });
                  }}
                >
                  <option value="hot">hot</option>
                  <option value="warm">warm</option>
                  <option value="cold">cold</option>
                </select>
              </TableCell>
              <TableCell>
                <Badge variant={l.followUpDone ? "secondary" : "default"}>
                  {l.followUpDone ? "Done" : "Open"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await updateLeadAction({
                          id: l.id,
                          intent: l.intent,
                          followUpDone: !l.followUpDone,
                        });
                        router.refresh();
                      });
                    }}
                  >
                    Toggle follow-up
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await deleteLeadAction(l.id);
                        router.refresh();
                      });
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
