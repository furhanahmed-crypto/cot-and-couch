"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteLeadAction,
  updateLeadAction,
} from "@/app/admin/ops/actions";
import { AppSelect } from "@/components/ui/app-select";
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
import type { AdminLead } from "@/services/leads";
import type { Lead } from "@/types";

export function LeadsManager({ leads }: { leads: AdminLead[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="min-w-0 space-y-3">
      <p className="text-sm text-muted-foreground">
        Storefront customers (email / OTP login) appear here automatically as
        leads. Update intent and follow-up as you contact them.
      </p>
      <div className="-mx-1 overflow-x-auto rounded-xl border border-border bg-card sm:mx-0">
        <Table className="min-w-[720px] sm:min-w-[900px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Intent</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell>
                  <div className="font-medium">{l.name}</div>
                  {l.area ? (
                    <div className="text-xs text-muted-foreground">{l.area}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{l.email || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.mobile && l.mobile !== l.email ? l.mobile : "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      l.source === "storefront"
                        ? "bg-emerald-500/15 font-normal text-emerald-800 dark:text-emerald-300"
                        : "font-normal"
                    }
                  >
                    {l.source === "storefront" ? "Storefront" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {l.firstSeen}
                </TableCell>
                <TableCell>
                  <AppSelect
                    value={l.intent}
                    disabled={pending}
                    triggerClassName="w-[6.5rem] capitalize"
                    onValueChange={(v) => {
                      const intent = v as Lead["intent"];
                      startTransition(async () => {
                        await updateLeadAction({
                          id: l.id,
                          intent,
                          followUpDone: l.followUpDone,
                        });
                        router.refresh();
                      });
                    }}
                    items={[
                      { value: "hot", label: "hot" },
                      { value: "warm", label: "warm" },
                      { value: "cold", label: "cold" },
                    ]}
                  />
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
                    {l.source === "manual" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            await deleteLeadAction(l.id);
                            toast.success("Lead removed");
                            router.refresh();
                          });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No leads yet — customers appear here after storefront login.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
